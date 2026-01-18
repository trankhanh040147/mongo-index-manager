package job

import (
	"context"

	"github.com/bytedance/sonic"
	"github.com/hibiken/asynq"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"doctor-manager-api/common/constants"
	"doctor-manager-api/database/mongo/models"
	"doctor-manager-api/database/mongo/queries"
	"doctor-manager-api/utilities/mongodb"
)

type PayloadSyncIndexByCollections struct {
	Collections   []string           `json:"collections"`
	ClientIndexes []mongodb.Index    `json:"client_indexes"`
	ServerIndexes []models.Index     `json:"server_indexes"`
	Uri           string             `json:"uri"`
	DBName        string             `json:"db_name"`
	SyncId        primitive.ObjectID `json:"sync_id"`
}

func handleSyncIndexByCollection(ctx context.Context, t *asynq.Task) error {
	var payload PayloadSyncIndexByCollections
	syncQuery := queries.NewSync(ctx)
	if err := sonic.Unmarshal(t.Payload(), &payload); err != nil {
		logger.Error().Err(err).Str("function", "handleSyncIndexByCollection").Str("functionInline", "sonic.Unmarshal").Interface("payload", payload).Msg("job-handler")
		if updateErr := syncQuery.UpdateStatusById(payload.SyncId, constants.SyncStatusFailed, 0, err.Error()); updateErr != nil {
			logger.Error().Err(updateErr).Str("function", "handleSyncIndexByCollection").Str("functionInline", "syncQuery.UpdateStatusById").Msg("job-handler")
		}
		return asynq.SkipRetry
	}
	// Set status to running at start
	if err := syncQuery.UpdateStatusById(payload.SyncId, constants.SyncStatusRunning, 0, ""); err != nil {
		logger.Error().Err(err).Str("function", "handleSyncIndexByCollection").Str("functionInline", "syncQuery.UpdateStatusById").Msg("job-handler")
	}
	mapIndexClient := make(map[string]map[string]mongodb.Index)
	for _, index := range payload.ClientIndexes {
		if _, exists := mapIndexClient[index.Collection]; !exists {
			mapIndexClient[index.Collection] = make(map[string]mongodb.Index)
		}
		mapIndexClient[index.Collection][index.KeySignature] = index
	}
	var (
		missingIndexes   = make([]mongodb.Index, 0)
		redundantIndexes = make([]mongodb.Index, 0)
	)
	mapIndexManager := make(map[string]map[string]models.Index)
	for _, index := range payload.ServerIndexes {
		if _, exists := mapIndexManager[index.Collection]; !exists {
			mapIndexManager[index.Collection] = make(map[string]models.Index)
		}
		mapIndexManager[index.Collection][index.KeySignature] = index
	}

	for _, collection := range payload.Collections {
		for _, index := range mapIndexManager[collection] {
			keys := make([]mongodb.IndexKey, len(index.Keys))
			for i, key := range index.Keys {
				keys[i].Field = key.Field
				keys[i].Value = key.Value
			}
			indexItem := mongodb.Index{
				Collection: collection,
				Options: mongodb.IndexOption{
					ExpireAfterSeconds: index.Options.ExpireAfterSeconds,
					IsUnique:           index.Options.IsUnique,
				},
				Name: index.Name,
				Keys: keys,
			}
			if _, exists := mapIndexClient[collection][index.KeySignature]; exists {
				delete(mapIndexClient[collection], index.KeySignature)
			} else {
				missingIndexes = append(missingIndexes, indexItem)
			}
		}
		for _, index := range mapIndexClient[collection] {
			keys := make([]mongodb.IndexKey, len(index.Keys))
			for i, key := range index.Keys {
				keys[i].Field = key.Field
				keys[i].Value = key.Value
			}
			redundantIndexes = append(redundantIndexes, mongodb.Index{
				Collection: collection,
				Options: mongodb.IndexOption{
					ExpireAfterSeconds: index.Options.ExpireAfterSeconds,
					IsUnique:           index.Options.IsUnique,
				},
				Name: index.Name,
				Keys: keys,
			})
		}
	}
	dbClient, err := mongodb.New(payload.Uri)
	if err != nil {
		logger.Error().Err(err).Str("function", "handleSyncIndexByCollection").Str("functionInline", "mongodb.New").Msg("job-controller")
		if updateErr := syncQuery.UpdateStatusById(payload.SyncId, constants.SyncStatusFailed, 0, err.Error()); updateErr != nil {
			logger.Error().Err(updateErr).Str("function", "handleSyncIndexByCollection").Str("functionInline", "syncQuery.UpdateStatusById").Msg("job-handler")
		}
		return err
	}
	totalCollections := len(payload.Collections)
	totalOperations := totalCollections * 2 // Remove and create operations
	calculateProgress := func(processed, total int) int {
		if total == 0 {
			return 100
		}
		return int(float64(processed) / float64(total) * 100)
	}
	currentProgress := 0
	if err = dbClient.RemoveIndexes(payload.DBName, redundantIndexes); err != nil {
		logger.Error().Err(err).Str("function", "handleSyncIndexByCollection").Str("functionInline", "dbClient.RemoveIndexes").Msg("job-controller")
		if updateErr := syncQuery.UpdateStatusById(payload.SyncId, constants.SyncStatusFailed, currentProgress, err.Error()); updateErr != nil {
			logger.Error().Err(updateErr).Str("function", "handleSyncIndexByCollection").Str("functionInline", "syncQuery.UpdateStatusById").Msg("job-handler")
		}
		return asynq.SkipRetry
	}
	currentProgress = calculateProgress(totalCollections, totalOperations)
	if err = syncQuery.UpdateStatusById(payload.SyncId, constants.SyncStatusRunning, currentProgress, ""); err != nil {
		logger.Error().Err(err).Str("function", "handleSyncIndexByCollection").Str("functionInline", "syncQuery.UpdateStatusById").Msg("job-handler")
	}
	if err = dbClient.CreateIndexes(payload.DBName, missingIndexes); err != nil {
		logger.Error().Err(err).Str("function", "handleSyncIndexByCollection").Str("functionInline", "dbClient.CreateIndexes").Msg("job-controller")
		if updateErr := syncQuery.UpdateStatusById(payload.SyncId, constants.SyncStatusFailed, currentProgress, err.Error()); updateErr != nil {
			logger.Error().Err(updateErr).Str("function", "handleSyncIndexByCollection").Str("functionInline", "syncQuery.UpdateStatusById").Msg("job-handler")
		}
		return asynq.SkipRetry
	}
	if err = syncQuery.UpdateStatusById(payload.SyncId, constants.SyncStatusCompleted, 100, ""); err != nil {
		logger.Error().Err(err).Str("function", "handleSyncIndexByCollection").Str("functionInline", "syncQuery.UpdateStatusById").Msg("job-handler")
		return asynq.SkipRetry
	}
	return nil
}
