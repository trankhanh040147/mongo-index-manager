package jobqueue

import (
	"context"
	"time"

	"github.com/hibiken/asynq"

	"doctor-manager-api/common/logging"
)

const (
	defaultConcurrency  = 10
	defaultPoolSize     = 10
	defaultDialTimeout  = 5 * time.Second
	defaultReadTimeout  = 3 * time.Second
	defaultWriteTimeout = 3 * time.Second
)

var (
	global        Service
	logger        = logging.GetLogger()
	defaultOption = Option{
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
	PoolSize     int
	Concurrency  int
}

func New(redisAddr string, opts ...Option) (Service, error) {
	opt := defaultOption
	if len(opts) > 0 {
		opt.set(opts[0])
	}
	serv := &service{
		client: asynq.NewClient(asynq.RedisClientOpt{
			Addr:         redisAddr,
			DialTimeout:  opt.DialTimeout,
			ReadTimeout:  opt.ReadTimeout,
			WriteTimeout: opt.WriteTimeout,
			PoolSize:     opt.PoolSize,
		}),
		server: asynq.NewServer(
			asynq.RedisClientOpt{Addr: redisAddr},
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
}

func GetGlobal() Service {
	return global
}
