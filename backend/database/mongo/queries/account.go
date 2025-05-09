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

type AccountQuery interface {
	GetByUsernameOrEmail(username, email string, opts ...OptionsQuery) (account *models.Account, err error)
	GetById(id primitive.ObjectID, opts ...OptionsQuery) (account *models.Account, err error)
	CreateOne(account models.Account) (newAccount *models.Account, err error)
	UpdateProfileById(id primitive.ObjectID, profile AccountUpdateProfileByIdRequest) error
}

type accountQuery struct {
	collection *mongoDriver.Collection
	context    context.Context
}

func NewAccount(ctx context.Context) AccountQuery {
	return &accountQuery{
		collection: mongo.NewUtilityService().GetAccountCollection(),
		context:    ctx,
	}
}

func (q *accountQuery) GetByUsernameOrEmail(username, email string, opts ...OptionsQuery) (*models.Account, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	var data models.Account
	optFind := &options.FindOneOptions{Projection: opt.QueryOnlyField()}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	if err := q.collection.FindOne(ctx, bson.M{"$or": bson.A{"username", username, "email", email}}, optFind).Decode(&data); err != nil {
		if errors.Is(err, mongoDriver.ErrNoDocuments) {
			return nil, response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: "Account not found"})
		}
		logger.Error().Err(err).Str("function", "GetByUsernameOrEmail").Str("functionInline", "q.collection.FindOne").Msg("accountQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return &data, nil
}

func (q *accountQuery) CreateOne(account models.Account) (*models.Account, error) {
	currentTime := time.Now()
	account.CreatedAt = currentTime
	account.UpdatedAt = currentTime
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	result, err := q.collection.InsertOne(ctx, account)
	if err != nil {
		if mongoDriver.IsDuplicateKeyError(err) {
			return nil, response.NewError(fiber.StatusConflict, response.ErrorOptions{Data: respErr.ErrResourceConflict})
		}
		logger.Error().Err(err).Str("function", "CreateOne").Str("functionInline", "q.collection.InsertOne").Msg("accountQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	account.Id = result.InsertedID.(primitive.ObjectID)
	return &account, nil
}

func (q *accountQuery) GetById(id primitive.ObjectID, opts ...OptionsQuery) (*models.Account, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	var data models.Account
	optFind := &options.FindOneOptions{Projection: opt.QueryOnlyField()}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	if err := q.collection.FindOne(ctx, bson.M{"_id": id}, optFind).Decode(&data); err != nil {
		if errors.Is(err, mongoDriver.ErrNoDocuments) {
			return nil, response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: "Account not found"})
		}
		logger.Error().Err(err).Str("function", "GetById").Str("functionInline", "q.collection.FindOne").Msg("accountQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return &data, nil
}

func (q *accountQuery) UpdateProfileById(id primitive.ObjectID, profile AccountUpdateProfileByIdRequest) error {
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	result, err := q.collection.UpdateByID(ctx, id, bson.M{
		"$set": bson.M{
			"updated_at": time.Now(),
			"first_name": profile.FirstName,
			"last_name":  profile.LastName,
			"avatar":     profile.Avatar,
			"phone":      profile.Phone,
		},
	})
	if err != nil {
		logger.Error().Err(err).Str("function", "UpdateProfileById").Str("functionInline", "q.collection.UpdateByID").Msg("accountQuery")
		return response.NewError(fiber.StatusInternalServerError)
	}
	if result.MatchedCount == 0 {
		return response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: respErr.ErrResourceNotFound})
	}
	return nil
}
