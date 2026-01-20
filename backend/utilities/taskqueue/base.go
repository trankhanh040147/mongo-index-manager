package taskqueue

import (
	"context"
)

const (
	defaultConcurrency = 10
)

var (
	global Service
)

type Service interface {
	InitGlobal()
	Stop()
	Start()
	HandleFunc(pattern string, handler func(context.Context, *Task) error)
	EnqueueTask(task *Task) (taskInfo *TaskInfo, err error)
	NewTask(taskType string, payload []byte) *Task
}

type Option struct {
	Concurrency int
}

func GetGlobal() Service {
	return global
}
