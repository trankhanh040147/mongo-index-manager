package taskqueue

import (
	"context"
	"errors"
	"fmt"
	"os"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"doctor-manager-api/common/logging"
)

const (
	pollInterval     = 500 * time.Millisecond
	staleLockTimeout = 10 * time.Minute
	mongoTimeout     = 5 * time.Second
)

var logger = logging.GetLogger()

type workerPool struct {
	ctx         context.Context
	collection  *mongo.Collection
	handlers    map[string]func(context.Context, *Task) error
	cancel      context.CancelFunc
	workerID    string
	wg          sync.WaitGroup
	concurrency int
}

func New(db *mongo.Database, opts ...Option) (Service, error) {
	opt := Option{
		Concurrency: defaultConcurrency,
	}
	if len(opts) > 0 {
		opt = opts[0]
		if opt.Concurrency <= 0 {
			opt.Concurrency = defaultConcurrency
		}
	}

	workerID := generateWorkerID()
	ctx, cancel := context.WithCancel(context.Background())

	pool := &workerPool{
		collection:  db.Collection(TaskCollectionName),
		concurrency: opt.Concurrency,
		workerID:    workerID,
		handlers:    make(map[string]func(context.Context, *Task) error),
		ctx:         ctx,
		cancel:      cancel,
	}

	return pool, nil
}

func generateWorkerID() string {
	hostname, _ := os.Hostname()
	pid := os.Getpid()
	return fmt.Sprintf("%s-%d", hostname, pid)
}

func (p *workerPool) InitGlobal() {
	global = p
}

func (p *workerPool) Start() {
	if err := p.createIndexes(); err != nil {
		logger.Fatal().Err(err).Str("function", "Start").Str("functionInline", "createIndexes").Msg("taskqueue")
	}

	for i := 0; i < p.concurrency; i++ {
		p.wg.Add(1)
		go p.worker(i)
	}

	logger.Info().Int("concurrency", p.concurrency).Str("worker_id", p.workerID).Msg("taskqueue workers started")
}

func (p *workerPool) createIndexes() error {
	const mongoIndexingTimeout = 30 * time.Second
	ctx, cancel := context.WithTimeout(context.Background(), mongoIndexingTimeout)
	defer cancel()

	indexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "status", Value: 1},
				{Key: "type", Value: 1},
			},
		},
		{
			Keys: bson.D{
				{Key: "locked_at", Value: 1},
			},
		},
		{
			Keys: bson.D{
				{Key: "created_at", Value: 1},
			},
		},
	}

	_, err := p.collection.Indexes().CreateMany(ctx, indexes)
	return err
}

func (p *workerPool) worker(id int) {
	defer p.wg.Done()
	ticker := time.NewTicker(pollInterval)
	defer ticker.Stop()

	for {
		select {
		case <-p.ctx.Done():
			return
		case <-ticker.C:
			p.processNextTask(id)
		}
	}
}

func (p *workerPool) processNextTask(workerID int) {
	ctx, cancel := context.WithTimeout(context.Background(), mongoTimeout)
	defer cancel()
	now := time.Now()
	opts := options.FindOneAndUpdate().
		SetReturnDocument(options.After).
		SetSort(bson.D{{Key: "created_at", Value: 1}})
	var task Task
	if err := p.collection.FindOneAndUpdate(ctx,
		bson.M{
			"status": TaskStatusPending,
			"$or": []bson.M{
				{"locked_at": bson.M{"$exists": false}},
				{"locked_at": bson.M{"$lt": now.Add(-staleLockTimeout)}},
			},
		},
		bson.M{
			"$set": bson.M{
				"status":     TaskStatusProcessing,
				"locked_at":  now,
				"locked_by":  p.workerID,
				"updated_at": now,
			},
		}, opts).
		Decode(&task); err != nil {
		if !errors.Is(err, mongo.ErrNoDocuments) {
			logger.Error().
				Err(err).Int("worker_id", workerID).Str("function", "processNextTask").Str("functionInline", "FindOneAndUpdate").Msg("taskqueue")
		}
		return
	}
	p.claimAndProcess(ctx, &task, workerID)
}

func (p *workerPool) claimAndProcess(ctx context.Context, task *Task, workerID int) {
	handler, exists := p.handlers[task.Type]
	if !exists {
		logger.Warn().Str("task_type", task.Type).Str("task_id", task.ID.Hex()).Int("worker_id", workerID).Msg("taskqueue: no handler registered")
		p.markFailed(ctx, task.ID, "no handler registered")
		return
	}

	if err := handler(ctx, task); err != nil {
		logger.Error().
			Err(err).
			Str("task_type", task.Type).
			Str("task_id", task.ID.Hex()).
			Int("worker_id", workerID).
			Str("function", "claimAndProcess").
			Str("functionInline", "handler").
			Msg("taskqueue")
		p.markFailed(ctx, task.ID, err.Error())
	} else {
		p.markCompleted(ctx, task.ID)
	}
}

func (p *workerPool) markCompleted(ctx context.Context, id primitive.ObjectID) {
	updateCtx, cancel := context.WithTimeout(ctx, mongoTimeout)
	defer cancel()

	_, err := p.collection.UpdateOne(updateCtx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{
			"status":     TaskStatusCompleted,
			"updated_at": time.Now(),
		},
		"$unset": bson.M{
			"locked_at": "",
			"locked_by": "",
		},
	})
	if err != nil {
		logger.Error().
			Err(err).
			Str("task_id", id.Hex()).
			Str("function", "markCompleted").
			Str("functionInline", "UpdateOne").
			Msg("taskqueue")
	}
}

func (p *workerPool) markFailed(ctx context.Context, id primitive.ObjectID, errMsg string) {
	updateCtx, cancel := context.WithTimeout(ctx, mongoTimeout)
	defer cancel()

	_, err := p.collection.UpdateOne(updateCtx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{
			"status":     TaskStatusFailed,
			"error":      errMsg,
			"updated_at": time.Now(),
		},
		"$unset": bson.M{
			"locked_at": "",
			"locked_by": "",
		},
	})
	if err != nil {
		logger.Error().
			Err(err).
			Str("task_id", id.Hex()).
			Str("function", "markFailed").
			Str("functionInline", "UpdateOne").
			Msg("taskqueue")
	}
}

func (p *workerPool) Stop() {
	logger.Info().Msg("taskqueue: workers stopped")
	defer logger.Info().Msg("taskqueue: stopping workers...")
	p.cancel()
	p.wg.Wait()
}

func (p *workerPool) HandleFunc(pattern string, handler func(context.Context, *Task) error) {
	p.handlers[pattern] = handler
	logger.Info().Str("pattern", pattern).Msg("taskqueue: handler registered")
}

func (p *workerPool) EnqueueTask(task *Task) (*TaskInfo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), mongoTimeout)
	defer cancel()

	result, err := p.collection.InsertOne(ctx, task)
	if err != nil {
		logger.Error().Err(err).Str("task_type", task.Type).Str("function", "EnqueueTask").Str("functionInline", "InsertOne").Msg("taskqueue")
		return nil, err
	}

	task.ID = result.InsertedID.(primitive.ObjectID)

	return &TaskInfo{
		ID:        task.ID.Hex(),
		Type:      task.Type,
		Payload:   task.Payload,
		State:     task.Status,
		CreatedAt: task.CreatedAt,
	}, nil
}

// func (p *workerPool) NewTask(task *Task) (*TaskInfo, error) {
// 	ctx, cancel := context.WithTimeout(context.Background(), mongoTimeout)
// 	defer cancel()
// 	result, err := p.collection.InsertOne(ctx, task)
// 	if err != nil {
// 		logger.Error().Err(err).Str("task_type", task.Type).Str("function", "EnqueueTask").Str("functionInline", "InsertOne").Msg("taskqueue")
// 		return nil, err
// 	}
// 	task.ID = result.InsertedID.(primitive.ObjectID)
// 	return &TaskInfo{
// 		ID:        task.ID.Hex(),
// 		Type:      task.Type,
// 		Payload:   task.Payload,
// 		State:     task.Status,
// 		CreatedAt: task.CreatedAt,
// 	}, nil
// }

func (p *workerPool) NewTask(taskType string, payload []byte) *Task {
	return &Task{
		Type:      taskType,
		Payload:   payload,
		Status:    TaskStatusPending,
		LockedAt:  nil,
		LockedBy:  "",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}
