package job

import (
	"context"

	"github.com/bytedance/sonic"
	"github.com/hibiken/asynq"
)

type PayloadSyncIndexByCollection struct {
}

func handleSyncIndexByCollection(ctx context.Context, t *asynq.Task) error {
	var p PayloadSyncIndexByCollection
	if err := sonic.Unmarshal(t.Payload(), &p); err != nil {
		logger.Error().Err(err).Str("function", "handleSyncIndexByCollection").Str("functionInline", "sonic.Unmarshal").Interface("payload", p).Msg("job-handler")
		return asynq.SkipRetry
	}
	return nil
}
