package job

import (
	"context"

	"github.com/bytedance/sonic"
	"github.com/hibiken/asynq"

	"doctor-manager-api/database/mongo/models"
	"doctor-manager-api/utilities/mongodb"
)

type PayloadSyncIndexByCollections struct {
	Collections   []string        `json:"collections"`
	ClientIndexes []mongodb.Index `json:"client_indexes"`
	ServerIndexes []models.Index  `json:"server_indexes"`
	Uri           string          `json:"uri"`
	DBName        string          `json:"db_name"`
}

func handleSyncIndexByCollection(ctx context.Context, t *asynq.Task) error {
	var payload PayloadSyncIndexByCollections
	if err := sonic.Unmarshal(t.Payload(), &payload); err != nil {
		logger.Error().Err(err).Str("function", "handleSyncIndexByCollection").Str("functionInline", "sonic.Unmarshal").Interface("payload", payload).Msg("job-handler")
		return asynq.SkipRetry
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
		logger.Error().Err(err).Str("function", "handleSyncIndexByCollection").Str("functionInline", "dbClient.RemoveIndexes").Msg("job-controller")
		return err
	}
	if err = dbClient.RemoveIndexes(payload.DBName, redundantIndexes); err != nil {
		logger.Error().Err(err).Str("function", "handleSyncIndexByCollection").Str("functionInline", "dbClient.RemoveIndexes").Msg("job-controller")
		return asynq.SkipRetry
	}
	if err = dbClient.CreateIndexes(payload.DBName, missingIndexes); err != nil {
		logger.Error().Err(err).Str("function", "handleSyncIndexByCollection").Str("functionInline", "dbClient.CreateIndexes").Msg("job-controller")
		return asynq.SkipRetry
	}
	return nil
}
