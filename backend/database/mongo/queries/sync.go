package queries

import (
	"context"
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	mongoDriver "go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"doctor-manager-api/common/response"
	respErr "doctor-manager-api/common/response/error"
	"doctor-manager-api/database/mongo"
	"doctor-manager-api/database/mongo/models"
)

type SyncQuery interface {
	GetByDatabaseIdAndIsFinished(databaseId primitive.ObjectID, isFinished bool, opts ...OptionsQuery) (sync *models.Sync, err error)
	CreateOne(sync models.Sync) (newIndex *models.Sync, err error)
	UpdateIsFinishedById(id primitive.ObjectID, isFinished bool) error
}

type syncQuery struct {
	collection *mongoDriver.Collection
	context    context.Context
}

func NewSync(ctx context.Context) SyncQuery {
	return &syncQuery{
		collection: mongo.NewUtilityService().GetSyncCollection(),
		context:    ctx,
	}
}

func (q *syncQuery) CreateOne(sync models.Sync) (*models.Sync, error) {
	currentTime := time.Now()
	sync.CreatedAt = currentTime
	sync.UpdatedAt = currentTime
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	result, err := q.collection.InsertOne(ctx, sync)
	if err != nil {
		if mongoDriver.IsDuplicateKeyError(err) {
			return nil, response.NewError(fiber.StatusConflict, response.ErrorOptions{Data: respErr.ErrResourceConflict})
		}
		logger.Error().Err(err).Str("function", "CreateOne").Str("functionInline", "q.collection.InsertOne").Msg("syncQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	sync.Id = result.InsertedID.(primitive.ObjectID)
	return &sync, nil
}

func (q *syncQuery) GetByDatabaseIdAndIsFinished(databaseId primitive.ObjectID, isFinished bool, opts ...OptionsQuery) (*models.Sync, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	var data models.Sync
	optFind := &options.FindOneOptions{Projection: opt.QueryOnlyField()}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	if err := q.collection.FindOne(ctx, bson.M{"database_id": databaseId, "is_finished": false}, optFind).Decode(&data); err != nil {
		if errors.Is(err, mongoDriver.ErrNoDocuments) {
			return nil, response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: "Sync not found"})
		}
		logger.Error().Err(err).Str("function", "GetByDatabaseId").Str("functionInline", "q.collection.FindOne").Msg("syncQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return &data, nil
}

func (q *syncQuery) UpdateIsFinishedById(id primitive.ObjectID, isFinished bool) error {
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	result, err := q.collection.UpdateByID(ctx, id, bson.M{
		"$set": bson.M{
			"updated_at":  time.Now(),
			"is_finished": isFinished,
		},
	})
	if err != nil {
		logger.Error().Err(err).Str("function", "UpdateIsFinishedById").Str("functionInline", "q.collection.UpdateByID").Msg("syncQuery")
		return response.NewError(fiber.StatusInternalServerError)
	}
	if result.MatchedCount == 0 {
		return response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: "Sync not found"})
	}
	return nil
}
