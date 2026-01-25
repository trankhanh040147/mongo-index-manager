package mongodb

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func isTextIndex(keys []IndexKey) bool {
	for _, key := range keys {
		if key.Field == "_fts" || key.Field == "_ftsx" {
			return true
		}
		if v, ok := key.Value.(string); ok && v == "text" {
			return true
		}
	}
	return false
}

func (s *service) TestConnection(uri string) error {
	opts := options.Client()
	opts.ApplyURI(uri)
	ctx, cancel := context.WithTimeout(context.Background(), defaultContextTimeout)
	defer cancel()
	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		logger.Error().Err(err).Str("function", "TestConnection").Str("functionInline", "mongo.Connect").Msg("mongodb")
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
			logger.Error().Err(err).Str("collection", collName).Str("function", "GetIndexesByDbNameAndCollections").Str("functionInline", "coll.Indexes.List").Msg("mongodb")
			return nil, err
		}
		for cursor.Next(ctx) {
			var indexDoc bson.M
			if err = cursor.Decode(&indexDoc); err != nil {
				logger.Error().Err(err).Str("collection", collName).Str("function", "GetIndexesByDbNameAndCollections").Str("functionInline", "cursor.Decode").Msg("mongodb")
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
			isDefaultIndex := false
			for k, v := range keys {
				if k == "_id" {
					isDefaultIndex = true
					break
				}
				if k == "_fts" || k == "_ftsx" {
					index.IsText = true
				}
				key := IndexKey{
					Field: k,
				}
				if value, ok := v.(int32); ok {
					key.Value = value
				} else if value, ok := v.(string); ok {
					key.Value = value
				} else {
					key.Value = v
				}
				index.Keys = append(index.Keys, key)
			}
			if isDefaultIndex {
				continue
			}
			if isUnique, ok := indexDoc["unique"].(bool); ok {
				index.Options.IsUnique = isUnique
			}
			if expires, ok := indexDoc["expireAfterSeconds"].(int32); ok {
				index.Options.ExpireAfterSeconds = &expires
			}
			if collationDoc, ok := indexDoc["collation"].(bson.M); ok {
				collation := &Collation{}
				if locale, ok := collationDoc["locale"].(string); ok {
					collation.Locale = locale
				}
				if strength, ok := collationDoc["strength"].(int32); ok {
					strengthInt := int(strength)
					collation.Strength = &strengthInt
				} else if strength, ok := collationDoc["strength"].(int); ok {
					collation.Strength = &strength
				}
				if caseLevel, ok := collationDoc["caseLevel"].(bool); ok {
					collation.CaseLevel = &caseLevel
				}
				if caseFirst, ok := collationDoc["caseFirst"].(string); ok {
					collation.CaseFirst = caseFirst
				}
				if numericOrdering, ok := collationDoc["numericOrdering"].(bool); ok {
					collation.NumericOrdering = &numericOrdering
				}
				if collation.Locale != "" {
					index.Options.Collation = collation
				}
			}
			if defaultLanguage, ok := indexDoc["default_language"].(string); ok {
				index.Options.DefaultLanguage = defaultLanguage
			}
			if weights, ok := indexDoc["weights"].(bson.M); ok {
				index.Options.Weights = make(map[string]interface{})
				for k, v := range weights {
					index.Options.Weights[k] = v
				}
			}
			if name, ok := indexDoc["name"].(string); ok {
				index.Name = name
			}
			index.KeySignature = index.GetKeySignature()
			indexes = append(indexes, index)
		}
		if err = cursor.Err(); err != nil {
			logger.Error().Err(err).Str("collection", collName).Str("function", "GetIndexesByDbNameAndCollections").Str("functionInline", "cursor.Err").Msg("mongodb")
			return nil, err
		}
		if err = cursor.Close(ctx); err != nil {
			logger.Error().Err(err).Str("collection", collName).Str("function", "GetIndexesByDbNameAndCollections").Str("functionInline", "cursor.Close").Msg("mongodb")
		}
	}
	return indexes, nil
}

func (s *service) RemoveIndexes(dbName string, indexes []Index) error {
	if len(indexes) == 0 {
		return nil
	}
	mapIndexByCollection := make(map[string][]Index)
	mapCollection := make(map[string]struct{})
	collections := make([]string, 0)
	for _, index := range indexes {
		if _, exists := mapCollection[index.Collection]; !exists {
			collections = append(collections, index.Collection)
			mapCollection[index.Collection] = struct{}{}
		}
		mapIndexByCollection[index.Collection] = append(mapIndexByCollection[index.Collection], index)
	}
	ctx, cancel := context.WithTimeout(context.Background(), defaultContextTimeout)
	defer cancel()
	for _, collName := range collections {
		if len(mapIndexByCollection[collName]) > 0 {
			coll := s.client.Database(dbName).Collection(collName)
			for _, index := range mapIndexByCollection[collName] {
				if _, err := coll.Indexes().DropOne(ctx, index.Name); err != nil {
					logger.Error().Err(err).Str("collection", collName).Str("function", "RemoveIndexes").Str("functionInline", "coll.Indexes().DropOne").Msg("mongodb")
					return err
				}
			}
		}
	}
	return nil
}

func (s *service) CreateIndexes(dbName string, indexes []Index) error {
	if len(indexes) == 0 {
		return nil
	}
	mapIndexByCollection := make(map[string][]mongo.IndexModel)
	mapCollection := make(map[string]struct{})
	collections := make([]string, 0)
	for _, index := range indexes {
		if _, exists := mapCollection[index.Collection]; !exists {
			collections = append(collections, index.Collection)
			mapCollection[index.Collection] = struct{}{}
		}
		mapIndexByCollection[index.Collection] = append(mapIndexByCollection[index.Collection], index.toIndexModel())
	}
	ctx, cancel := context.WithTimeout(context.Background(), defaultContextTimeout)
	defer cancel()
	for _, collName := range collections {
		if len(mapIndexByCollection[collName]) > 0 {
			coll := s.client.Database(dbName).Collection(collName)
			if _, err := coll.Indexes().CreateMany(ctx, mapIndexByCollection[collName]); err != nil {
				logger.Error().Err(err).Str("collection", collName).Str("function", "CreateIndexes").Str("functionInline", " coll.Indexes().CreateMany").Msg("mongodb")
				return err
			}
		}
	}
	return nil
}

func (s *service) GetIndexesByDbName(dbName string) ([]Index, error) {
	var indexes []Index
	ctx, cancel := context.WithTimeout(context.Background(), defaultContextTimeout)
	defer cancel()
	db := s.client.Database(dbName)
	collections, err := db.ListCollectionNames(ctx, bson.M{})
	if err != nil {
		logger.Error().Err(err).Str("dbName", dbName).Str("function", "GetIndexesByDbName").Str("functionInline", "db.ListCollectionNames").Msg("mongodb")
		return indexes, err
	}
	for _, collName := range collections {
		coll := db.Collection(collName)
		cursor, err := coll.Indexes().List(ctx)
		if err != nil {
			logger.Error().Err(err).Str("collection", collName).Str("function", "GetIndexesByDbName").Str("functionInline", "coll.Indexes.List").Msg("mongodb")
			return nil, err
		}
		for cursor.Next(ctx) {
			var indexDoc bson.M
			if err = cursor.Decode(&indexDoc); err != nil {
				logger.Error().Err(err).Str("collection", collName).Str("function", "GetIndexesByDbName").Str("functionInline", "cursor.Decode").Msg("mongodb")
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
			isDefaultIndex := false
			for k, v := range keys {
				if k == "_id" {
					isDefaultIndex = true
					break
				}
				key := IndexKey{
					Field: k,
				}
				if value, ok := v.(int32); ok {
					key.Value = value
				} else if value, ok := v.(string); ok {
					key.Value = value
				} else {
					key.Value = v
				}
				index.Keys = append(index.Keys, key)
			}
			if isDefaultIndex {
				continue
			}
			if isUnique, ok := indexDoc["unique"].(bool); ok {
				index.Options.IsUnique = isUnique
			}
			if expires, ok := indexDoc["expireAfterSeconds"].(int32); ok {
				index.Options.ExpireAfterSeconds = &expires
			}
			if collationDoc, ok := indexDoc["collation"].(bson.M); ok {
				collation := &Collation{}
				if locale, ok := collationDoc["locale"].(string); ok {
					collation.Locale = locale
				}
				if strength, ok := collationDoc["strength"].(int32); ok {
					strengthInt := int(strength)
					collation.Strength = &strengthInt
				} else if strength, ok := collationDoc["strength"].(int); ok {
					collation.Strength = &strength
				}
				if caseLevel, ok := collationDoc["caseLevel"].(bool); ok {
					collation.CaseLevel = &caseLevel
				}
				if caseFirst, ok := collationDoc["caseFirst"].(string); ok {
					collation.CaseFirst = caseFirst
				}
				if numericOrdering, ok := collationDoc["numericOrdering"].(bool); ok {
					collation.NumericOrdering = &numericOrdering
				}
				if collation.Locale != "" {
					index.Options.Collation = collation
				}
			}
			if defaultLanguage, ok := indexDoc["default_language"].(string); ok {
				index.Options.DefaultLanguage = defaultLanguage
			}
			if weights, ok := indexDoc["weights"].(bson.M); ok {
				index.Options.Weights = make(map[string]interface{})
				for k, v := range weights {
					index.Options.Weights[k] = v
				}
			}
			if name, ok := indexDoc["name"].(string); ok {
				index.Name = name
			}
			index.IsText = isTextIndex(index.Keys)
			index.KeySignature = index.GetKeySignature()
			indexes = append(indexes, index)
		}
		if err = cursor.Err(); err != nil {
			logger.Error().Err(err).Str("collection", collName).Str("function", "GetIndexesByDbName").Str("functionInline", "cursor.Err").Msg("mongodb")
			return nil, err
		}
		if err = cursor.Close(ctx); err != nil {
			logger.Error().Err(err).Str("collection", collName).Str("function", "GetIndexesByDbName").Str("functionInline", "cursor.Close").Msg("mongodb")
		}
	}
	return indexes, nil
}

func (s *service) CreateCollection(dbName string, collectionName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), defaultContextTimeout)
	defer cancel()
	db := s.client.Database(dbName)
	err := db.CreateCollection(ctx, collectionName)
	if err != nil {
		logger.Error().Err(err).Str("dbName", dbName).Str("collection", collectionName).Str("function", "CreateCollection").Str("functionInline", "db.CreateCollection").Msg("mongodb")
		return err
	}
	return nil
}
