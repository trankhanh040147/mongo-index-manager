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

type AuthTokenQuery interface {
	CreateOne(token models.AuthToken) (newToken *models.AuthToken, err error)
	DeleteById(id primitive.ObjectID) error
	GetById(id primitive.ObjectID, opts ...OptionsQuery) (token *models.AuthToken, err error)
}

type authTokenQuery struct {
	collection *mongoDriver.Collection
	context    context.Context
}

func NewAuthToken(ctx context.Context) AuthTokenQuery {
	return &authTokenQuery{
		collection: mongo.NewUtilityService().GetAuthTokenCollection(),
		context:    ctx,
	}
}

func (q *authTokenQuery) CreateOne(token models.AuthToken) (*models.AuthToken, error) {
	currentTime := time.Now()
	token.CreatedAt = currentTime
	token.UpdatedAt = currentTime
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	result, err := q.collection.InsertOne(ctx, token)
	if err != nil {
		if mongoDriver.IsDuplicateKeyError(err) {
			return nil, response.NewError(fiber.StatusConflict, response.ErrorOptions{Data: respErr.ErrResourceConflict})
		}
		logger.Error().Err(err).Str("function", "CreateOne").Str("functionInline", "q.collection.InsertOne").Msg("authTokenQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	token.Id = result.InsertedID.(primitive.ObjectID)
	return &token, nil
}

func (q *authTokenQuery) DeleteById(id primitive.ObjectID) error {
	if _, err := q.collection.DeleteOne(q.context, bson.M{"_id": id}); err != nil {
		logger.Error().Err(err).Str("function", "DeleteById").Str("functionInline", "q.collection.DeleteOne").Msg("authTokenQuery")
		return response.NewError(fiber.StatusInternalServerError)
	}
	return nil
}

func (q *authTokenQuery) GetById(id primitive.ObjectID, opts ...OptionsQuery) (*models.AuthToken, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	optFind := &options.FindOneOptions{
		Projection: opt.QueryOnlyField(),
	}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	var token models.AuthToken
	if err := q.collection.FindOne(ctx, bson.M{
		"_id": id,
	}, optFind).Decode(&token); err != nil {
		if errors.Is(err, mongoDriver.ErrNoDocuments) {
			return nil, response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: respErr.ErrResourceNotFound})
		}
		logger.Error().Err(err).Str("function", "GetById").Str("functionInline", "q.collection.FindOne.Decode").Msg("authTokenQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return &token, nil
}
