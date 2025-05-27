package mongodb

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func (s *service) TestConnection(uri string) error {
	opts := options.Client()
	opts.ApplyURI(uri)
	ctx, cancel := context.WithTimeout(context.Background(), defaultContextTimeout)
	defer cancel()
	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		logger.Fatal().Err(err).Str("function", "TestConnection").Str("functionInline", "mongo.Connect").Msg("mongodb")
	}
	ctxPing, cancelPing := context.WithTimeout(context.Background(), defaultContextTimeout)
	defer cancelPing()
	if err = client.Ping(ctxPing, nil); err != nil {
		logger.Error().Err(err).Str("function", "TestConnection").Str("functionInline", "client.Ping").Msg("mongodb")
		return err
	}
	return nil
}

func (s *service) GetIndexesByDbNameAndCollections(dbName string, collections []string) ([]Index, error) {
	if len(collections) == 0 {
		return nil, nil
	}
	var indexes []Index
	ctx, cancel := context.WithTimeout(context.Background(), defaultContextTimeout)
	defer cancel()
	for _, collName := range collections {
		coll := s.client.Database(dbName).Collection(collName)
		cursor, err := coll.Indexes().List(ctx)
		if err != nil {
			logger.Fatal().Err(err).Str("collection", collName).Str("function", "GetIndexesByDbNameAndCollections").Str("functionInline", "coll.Indexes.List").Msg("mongodb")
			return nil, err
		}
		for cursor.Next(ctx) {
			var indexDoc bson.M
			if err = cursor.Decode(&indexDoc); err != nil {
				logger.Fatal().Err(err).Str("collection", collName).Str("function", "GetIndexesByDbNameAndCollections").Str("functionInline", "cursor.Decode").Msg("mongodb")
				return nil, err
			}
			keys, ok := indexDoc["key"].(bson.M)
			if !ok {
				continue
			}
			index := Index{
				Keys: make([]IndexKey, 0, len(keys)),
				Options: IndexOption{
					ExpireAfterSeconds: nil,
					IsUnique:           false,
				},
				Collection: collName,
			}
			isDefault := false
			for k, v := range keys {
				if k == "_id" {
					isDefault = true
					break
				}
				index.Keys = append(index.Keys, IndexKey{
					Field: k,
					Value: v.(int32),
				})
			}
			if isDefault {
				continue
			}
			if isUnique, ok := indexDoc["unique"].(bool); ok {
				index.Options.IsUnique = isUnique
			}
			if expires, ok := indexDoc["expireAfterSeconds"].(int32); ok {
				index.Options.ExpireAfterSeconds = &expires
			}
			if name, ok := indexDoc["name"].(string); ok {
				index.Name = name
			}
			index.KeySignature = index.GetKeySignature()
			indexes = append(indexes, index)
		}
		if err = cursor.Err(); err != nil {
			logger.Fatal().Err(err).Str("collection", collName).Str("function", "GetIndexesByDbNameAndCollections").Str("functionInline", "cursor.Err").Msg("mongodb")
			return nil, err
		}
		if err = cursor.Close(ctx); err != nil {
			logger.Fatal().Err(err).Str("collection", collName).Str("function", "GetIndexesByDbNameAndCollections").Str("functionInline", "cursor.Close").Msg("mongodb")
		}
	}
	return indexes, nil
}
