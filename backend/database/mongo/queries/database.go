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

type DatabaseQuery interface {
	GetById(id primitive.ObjectID, opts ...OptionsQuery) (database *models.Database, err error)
	GetByName(name string, opts ...OptionsQuery) (database *models.Database, err error)
	CreateOne(database models.Database) (newAccount *models.Database, err error)
	GetTotalByQuery(query string) (total int64, err error)
	GetByQuery(query string, opts ...OptionsQuery) (databases []models.Database, err error)
	UpdateInfoById(id primitive.ObjectID, request DatabaseUpdateInfoByIdRequest) error
}

type databaseQuery struct {
	collection *mongoDriver.Collection
	context    context.Context
}

func NewDatabase(ctx context.Context) DatabaseQuery {
	return &databaseQuery{
		collection: mongo.NewUtilityService().GetDatabaseCollection(),
		context:    ctx,
	}
}

func (q *databaseQuery) CreateOne(database models.Database) (*models.Database, error) {
	currentTime := time.Now()
	database.CreatedAt = currentTime
	database.UpdatedAt = currentTime
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	result, err := q.collection.InsertOne(ctx, database)
	if err != nil {
		if mongoDriver.IsDuplicateKeyError(err) {
			return nil, response.NewError(fiber.StatusConflict, response.ErrorOptions{Data: respErr.ErrResourceConflict})
		}
		logger.Error().Err(err).Str("function", "CreateOne").Str("functionInline", "q.collection.InsertOne").Msg("databaseQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	database.Id = result.InsertedID.(primitive.ObjectID)
	return &database, nil
}

func (q *databaseQuery) GetById(id primitive.ObjectID, opts ...OptionsQuery) (*models.Database, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	var data models.Database
	optFind := &options.FindOneOptions{Projection: opt.QueryOnlyField()}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	if err := q.collection.FindOne(ctx, bson.M{"_id": id}, optFind).Decode(&data); err != nil {
		if errors.Is(err, mongoDriver.ErrNoDocuments) {
			return nil, response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: "Account not found"})
		}
		logger.Error().Err(err).Str("function", "GetById").Str("functionInline", "q.collection.FindOne").Msg("databaseQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return &data, nil
}

func (q *databaseQuery) GetByName(name string, opts ...OptionsQuery) (*models.Database, error) {
	opt := NewOptions()
	if len(opts) > 0 {
		opt = opts[0]
	}
	var data models.Database
	optFind := &options.FindOneOptions{Projection: opt.QueryOnlyField()}
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	if err := q.collection.FindOne(ctx, bson.M{"name": name}, optFind).Decode(&data); err != nil {
		if errors.Is(err, mongoDriver.ErrNoDocuments) {
			return nil, response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: "Account not found"})
		}
		logger.Error().Err(err).Str("function", "GetByName").Str("functionInline", "q.collection.FindOne").Msg("databaseQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return &data, nil
}

func (q *databaseQuery) GetTotalByQuery(query string) (int64, error) {
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	regexQuery := primitive.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}
	filter := bson.M{}
	if query != "" {
		filter["$or"] = []bson.M{
			{"name": regexQuery},
			{"description": regexQuery},
			{"uri": regexQuery},
			{"db_name": regexQuery},
		}
	}
	result, err := q.collection.CountDocuments(ctx, filter)
	if err != nil {
		logger.Error().Err(err).Str("function", "GetTotalByQuery").Str("functionInline", "q.collection.CountDocuments").Msg("databaseQuery")
		return 0, response.NewError(fiber.StatusInternalServerError)
	}
	return result, nil
}

func (q *databaseQuery) GetByQuery(query string, opts ...OptionsQuery) ([]models.Database, error) {
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
	filter := bson.M{}
	regexQuery := primitive.Regex{Pattern: regexp.QuoteMeta(query), Options: "i"}
	if query != "" {
		filter["$or"] = []bson.M{
			{"name": regexQuery},
			{"description": regexQuery},
			{"uri": regexQuery},
			{"db_name": regexQuery},
		}
	}
	cursor, err := q.collection.Find(ctx, filter, optFind)
	if err != nil {
		logger.Error().Err(err).Str("function", "GetByQuery").Str("functionInline", "q.collection.Find").Msg("databaseQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	data := make([]models.Database, 0)
	if err = cursor.All(ctx, &data); err != nil {
		logger.Error().Err(err).Str("function", "GetByQuery").Str("functionInline", "cursor.All").Msg("databaseQuery")
		return nil, response.NewError(fiber.StatusInternalServerError)
	}
	return data, nil
}

func (q *databaseQuery) UpdateInfoById(id primitive.ObjectID, request DatabaseUpdateInfoByIdRequest) error {
	ctx, cancel := timeoutFunc(q.context)
	defer cancel()
	result, err := q.collection.UpdateByID(ctx, id, bson.M{
		"$set": bson.M{
			"updated_at":  time.Now(),
			"name":        request.Name,
			"uri":         request.Uri,
			"db_name":     request.DBName,
			"description": request.Description,
		},
	})
	if err != nil {
		logger.Error().Err(err).Str("function", "UpdateProfileById").Str("functionInline", "q.collection.UpdateByID").Msg("databaseQuery")
		return response.NewError(fiber.StatusInternalServerError)
	}
	if result.MatchedCount == 0 {
		return response.NewError(fiber.StatusNotFound, response.ErrorOptions{Data: respErr.ErrResourceNotFound})
	}
	return nil
}
