package jobqueue

import (
	"context"

	"github.com/hibiken/asynq"

	"doctor-manager-api/common/logging"
)

func (s *service) InitGlobal() {
	global = s
}

func (s *service) Start() {
	if err := s.server.Run(s.mux); err != nil {
		logging.GetLogger().Fatal().Err(err).Str("function", "Start").Str("functionInline", "s.server.Run").Msg("job_queue")
	}
}

func (s *service) HandleFunc(pattern string, handler func(context.Context, *asynq.Task) error) {
	s.mux.HandleFunc(pattern, handler)
}

func (s *service) Stop() {
	s.keepGoing = false
	s.server.Shutdown()
	_ = s.client.Close()
}

func (s *service) EnqueueTask(task *asynq.Task, opts ...asynq.Option) (*asynq.TaskInfo, error) {
	opts = append(opts, asynq.MaxRetry(s.opt.MaxRetry))
	return s.client.Enqueue(task, opts...)
}
