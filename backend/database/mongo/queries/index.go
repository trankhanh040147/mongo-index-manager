package queries

import (
	"context"
	"errors"
	"regexp"
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

type IndexQuery interface {
	GetById(id primitive.ObjectID, opts ...OptionsQuery) (index *models.Index, err error)
	GetByDatabaseIdCollectionWithNameOrSignature(databaseId primitive.ObjectID, collection string, keySignature, name string, opts ...OptionsQuery) (index *models.Index, err error)
	GetByDatabaseIdAndCollection(databaseId primitive.ObjectID, collection string, opts ...OptionsQuery) (indexes []models.Index, err error)
	GetByDatabaseIdCollectionAndQuery(databaseId primitive.ObjectID, collection, query string, opts ...OptionsQuery) (indexes []models.Index, err error)
	GetByDatabaseIdAndCollections(databaseId primitive.ObjectID, collections []string, opts ...OptionsQuery) (indexes []models.Index, err error)
	GetTotalByDatabaseIdAndCollection(databaseId primitive.ObjectID, collection string) (total int64, err error)
	GetTotalByDatabaseIdCollectionAndQuery(databaseId primitive.ObjectID, collection, query string) (total int64, err error)
	GetByDatabaseIdCollectionKeyFieldsAndIsUnique(databaseId primitive.ObjectID, collection string, keyFields []string, isUnique bool, opts ...OptionsQuery) (index *models.Index, err error)
	CreateOne(index models.Index) (newIndex *models.Index, err error)
	UpdateNameKeySignatureOptionsKeysById(id primitive.ObjectID, name, keySignature string, indexOpt models.IndexOption, keys []models.IndexKey) error
	DeleteById(id primitive.ObjectID) error
}

type indexQuery struct {
	collection *mongoDriver.Collection
	context    context.Context
}

func NewIndex(ctx context.Context) IndexQuery {
	return &indexQuery{
		collection: mongo.NewUtilityService().GetIndexCollection(),
		context:    ctx,
	}
}

func (q *indexQuery) CreateOne(index models.Index) (*models.Index, error) {
	currentTime := time.Now()
	index.CreatedAt = currentTime
	index.UpdatedAt = currentTime
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	result, err := q.collection.InsertOne(ctx, index)
	if err != nil {
		if mongoDriver.IsDuplicateKeyError(err) {
			return nil, response.NewError(fiber.StatusConflict, response.ErrorOptions{Data: respErr.ErrResourceConflict})
		}
		logger.Error().Err(err).Str("function", "CreateOne").Str("functionInline", "q.collection.InsertOne").Msg("indexQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	index.Id = result.InsertedID.(primitive.ObjectID)
	return &index, nil
}

func (q *indexQuery) GetById(id primitive.ObjectID, opts ...OptionsQuery) (*models.Index, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	var data models.Index
	optFind := &options.FindOneOptions{Projection: opt.QueryOnlyField()}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	if err := q.collection.FindOne(ctx, bson.M{"_id": id}, optFind).Decode(&data); err != nil {
		if errors.Is(err, mongoDriver.ErrNoDocuments) {
			return nil, response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: "Index not found"})
		}
		logger.Error().Err(err).Str("function", "GetById").Str("functionInline", "q.collection.FindOne").Msg("indexQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return &data, nil
}

func (q *indexQuery) GetByDatabaseIdCollectionWithNameOrSignature(databaseId primitive.ObjectID, collection string, keySignature, name string, opts ...OptionsQuery) (*models.Index, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	var data models.Index
	optFind := &options.FindOneOptions{Projection: opt.QueryOnlyField()}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	if err := q.collection.FindOne(ctx, bson.M{
		"database_id": databaseId,
		"collection":  collection,
		"$or": []bson.M{
			{"key_signature": keySignature},
			{"name": name},
		}}, optFind).Decode(&data); err != nil {
		if errors.Is(err, mongoDriver.ErrNoDocuments) {
			return nil, response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: "Index not found"})
		}
		logger.Error().Err(err).Str("function", "GetByDatabaseIdCollectionWithNameOrSignature").Str("functionInline", "q.collection.FindOne").Msg("indexQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return &data, nil
}

func (q *indexQuery) GetTotalByDatabaseIdCollectionAndQuery(databaseId primitive.ObjectID, collection, query string) (int64, error) {
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	regexQuery := primitive.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}
	filter := bson.M{"database_id": databaseId, "collection": collection}
	if query != "" {
		filter["$or"] = []bson.M{
			{"name": regexQuery},
			{"key_signature": regexQuery},
		}
	}
	result, err := q.collection.CountDocuments(ctx, filter)
	if err != nil {
		logger.Error().Err(err).Str("function", "GetTotalByDatabaseIdCollectionAndQuery").Str("functionInline", "q.collection.CountDocuments").Msg("indexQuery")
		return 0, response.NewError(fiber.StatusInternalServerError)
	}
	return result, nil
}

func (q *indexQuery) GetByDatabaseIdCollectionAndQuery(databaseId primitive.ObjectID, collection, query string, opts ...OptionsQuery) ([]models.Index, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	optFind := &options.FindOptions{
		Projection: opt.QueryOnlyField(),
		Limit:      opt.QueryPaginationLimit(),
		Skip:       opt.QueryPaginationSkip(),
		Sort:       opt.QuerySort(),
	}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	regexQuery := primitive.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}
	filter := bson.M{"database_id": databaseId, "collection": collection}
	if query != "" {
		filter["$or"] = []bson.M{
			{"name": regexQuery},
			{"key_signature": regexQuery},
		}
	}
	cursor, err := q.collection.Find(ctx, filter, optFind)
	if err != nil {
		logger.Error().Err(err).Str("function", "GetByDatabaseIdCollectionAndQuery").Str("functionInline", "q.collection.Find").Msg("indexQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	data := make([]models.Index, 0)
	if err = cursor.All(ctx, &data); err != nil {
		logger.Error().Err(err).Str("function", "GetByDatabaseIdCollectionAndQuery").Str("functionInline", "cursor.All").Msg("indexQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return data, nil
}

func (q *indexQuery) GetTotalByDatabaseIdAndCollection(databaseId primitive.ObjectID, collection string) (int64, error) {
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	result, err := q.collection.CountDocuments(ctx, bson.M{"database_id": databaseId, "collection": collection})
	if err != nil {
		logger.Error().Err(err).Str("function", "GetTotalByDatabaseIdAndCollection").Str("functionInline", "q.collection.CountDocuments").Msg("indexQuery")
		return 0, response.NewError(fiber.StatusInternalServerError)
	}
	return result, nil
}

func (q *indexQuery) GetByDatabaseIdAndCollection(databaseId primitive.ObjectID, collection string, opts ...OptionsQuery) ([]models.Index, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	optFind := &options.FindOptions{
		Projection: opt.QueryOnlyField(),
		Limit:      opt.QueryPaginationLimit(),
		Skip:       opt.QueryPaginationSkip(),
		Sort:       opt.QuerySort(),
	}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	cursor, err := q.collection.Find(ctx, bson.M{"database_id": databaseId, "collection": collection}, optFind)
	if err != nil {
		logger.Error().Err(err).Str("function", "GetByDatabaseIdAndCollection").Str("functionInline", "q.collection.Find").Msg("indexQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	data := make([]models.Index, 0)
	if err = cursor.All(ctx, &data); err != nil {
		logger.Error().Err(err).Str("function", "GetByDatabaseIdAndCollection").Str("functionInline", "cursor.All").Msg("indexQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return data, nil
}

func (q *indexQuery) GetByDatabaseIdCollectionKeyFieldsAndIsUnique(databaseId primitive.ObjectID, collection string, keyFields []string, isUnique bool, opts ...OptionsQuery) (*models.Index, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	var data models.Index
	optFind := &options.FindOneOptions{Projection: opt.QueryOnlyField()}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	if err := q.collection.FindOne(ctx, bson.M{
		"database_id":       databaseId,
		"collection":        collection,
		"options.is_unique": isUnique,
		"keys.field":        bson.M{"$all": keyFields},
		"keys":              bson.M{"$size": len(keyFields)},
	}, optFind).Decode(&data); err != nil {
		if errors.Is(err, mongoDriver.ErrNoDocuments) {
			return nil, response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: "Index not found"})
		}
		logger.Error().Err(err).Str("function", "GetByDatabaseIdCollectionKeyFieldsAndIsUnique").Str("functionInline", "q.collection.FindOne").Msg("indexQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return &data, nil
}

func (q *indexQuery) UpdateNameKeySignatureOptionsKeysById(id primitive.ObjectID, name, keySignature string, indexOpt models.IndexOption, keys []models.IndexKey) error {
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	result, err := q.collection.UpdateByID(ctx, id, bson.M{
		"$set": bson.M{
			"updated_at":    time.Now(),
			"name":          name,
			"key_signature": keySignature,
			"options":       indexOpt,
			"keys":          keys,
		},
	})
	if err != nil {
		if mongoDriver.IsDuplicateKeyError(err) {
			return response.NewError(fiber.StatusConflict, response.ErrorOptions{Data: respErr.ErrResourceConflict})
		}
		logger.Error().Err(err).Str("function", "UpdateNameKeySignatureOptionsKeysById").Str("functionInline", "q.collection.UpdateByID").Msg("indexQuery")
		return response.NewError(fiber.StatusInternalServerError)
	}
	if result.MatchedCount == 0 {
		return response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: respErr.ErrResourceNotFound})
	}
	return nil
}

func (q *indexQuery) DeleteById(id primitive.ObjectID) error {
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	result, err := q.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		logger.Error().Err(err).Str("function", "DeleteById").Str("functionInline", "q.collection.DeleteOne").Msg("indexQuery")
		return response.NewError(fiber.StatusInternalServerError)
	}
	if result.DeletedCount == 0 {
		return response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: respErr.ErrResourceNotFound})
	}
	return nil
}

func (q *indexQuery) GetByDatabaseIdAndCollections(databaseId primitive.ObjectID, collections []string, opts ...OptionsQuery) ([]models.Index, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	optFind := &options.FindOptions{
		Projection: opt.QueryOnlyField(),
	}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	cursor, err := q.collection.Find(ctx, bson.M{"database_id": databaseId, "collection": bson.M{"$in": collections}}, optFind)
	if err != nil {
		logger.Error().Err(err).Str("function", "GetByDatabaseIdAndCollections").Str("functionInline", "q.collection.Find").Msg("indexQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	data := make([]models.Index, 0)
	if err = cursor.All(ctx, &data); err != nil {
		logger.Error().Err(err).Str("function", "GetByDatabaseIdAndCollections").Str("functionInline", "cursor.All").Msg("indexQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return data, nil
}
