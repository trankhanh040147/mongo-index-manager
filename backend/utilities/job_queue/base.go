package jobqueue

import (
	"context"
	"time"

	"github.com/hibiken/asynq"
)

const (
	defaultMaxRetry     = 3
	defaultConcurrency  = 10
	defaultPoolSize     = 10
	defaultDialTimeout  = 5 * time.Second
	defaultReadTimeout  = 3 * time.Second
	defaultWriteTimeout = 3 * time.Second
)

var (
	global        Service
	defaultOption = Option{
		MaxRetry:     defaultMaxRetry,
		Concurrency:  defaultConcurrency,
		PoolSize:     defaultPoolSize,
		DialTimeout:  defaultDialTimeout,
		ReadTimeout:  defaultReadTimeout,
		WriteTimeout: defaultWriteTimeout,
	}
)

type Service interface {
	InitGlobal()
	Stop()
	Start()
	HandleFunc(pattern string, handler func(context.Context, *asynq.Task) error)
	EnqueueTask(task *asynq.Task, opts ...asynq.Option) (taskInfo *asynq.TaskInfo, err error)
}

type service struct {
	client    *asynq.Client
	server    *asynq.Server
	mux       *asynq.ServeMux
	opt       Option
	keepGoing bool
}

type Option struct {
	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	MaxRetry     int
	PoolSize     int
	Concurrency  int
}

func New(redisAddr string, opts ...Option) (Service, error) {
	redisConnOpt, err := asynq.ParseRedisURI(redisAddr)
	if err != nil {
		return nil, err
	}
	opt := defaultOption
	if len(opts) > 0 {
		opt.set(opts[0])
	}
	if redisClientOpt, ok := redisConnOpt.(asynq.RedisClientOpt); ok {
		redisClientOpt.DialTimeout = opt.DialTimeout
		redisClientOpt.ReadTimeout = opt.ReadTimeout
		redisClientOpt.WriteTimeout = opt.WriteTimeout
		redisClientOpt.PoolSize = opt.PoolSize
	}
	serv := &service{
		client: asynq.NewClient(redisConnOpt),
		server: asynq.NewServer(
			redisConnOpt,
			asynq.Config{
				Concurrency: opt.Concurrency,
				Queues: map[string]int{
					PriorityLabelLow:      PriorityLevelLow,
					PriorityLabelDefault:  PriorityLevelDefault,
					PriorityLabelCritical: PriorityLevelCritical,
				},
			},
		),
		mux:       asynq.NewServeMux(),
		opt:       opt,
		keepGoing: true,
	}
	return serv, nil
}

func (o *Option) set(opt Option) {
	if opt.DialTimeout > 0 {
		o.DialTimeout = opt.DialTimeout
	}
	if opt.ReadTimeout > 0 {
		o.ReadTimeout = opt.ReadTimeout
	}
	if opt.WriteTimeout > 0 {
		o.WriteTimeout = opt.WriteTimeout
	}
	if opt.PoolSize > 0 {
		o.PoolSize = opt.PoolSize
	}
	if opt.Concurrency > 0 {
		o.Concurrency = opt.Concurrency
	}
	if opt.MaxRetry > 0 {
		o.MaxRetry = opt.MaxRetry
	}
}

func GetGlobal() Service {
	return global
}
