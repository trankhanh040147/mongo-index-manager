package queries

import (
	"context"
	"errors"
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
	GetByNameOrKeySignature(keySignature, name string, opts ...OptionsQuery) (index *models.Index, err error)
	CreateOne(index models.Index) (newIndex *models.Index, err error)
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

func (q *indexQuery) GetByNameOrKeySignature(keySignature, name string, opts ...OptionsQuery) (*models.Index, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	var data models.Index
	optFind := &options.FindOneOptions{Projection: opt.QueryOnlyField()}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	if err := q.collection.FindOne(ctx, bson.M{"$or": []bson.M{
		{"key_signature": keySignature},
		{"name": name},
	}}, optFind).Decode(&data); err != nil {
		if errors.Is(err, mongoDriver.ErrNoDocuments) {
			return nil, response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: "Index not found"})
		}
		logger.Error().Err(err).Str("function", "GetByNameOrKeySignature").Str("functionInline", "q.collection.FindOne").Msg("indexQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return &data, nil
}
