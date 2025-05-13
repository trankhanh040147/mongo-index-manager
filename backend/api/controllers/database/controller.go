package database

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"doctor-manager-api/api/serializers"
	"doctor-manager-api/common/logging"
	"doctor-manager-api/common/request"
	"doctor-manager-api/common/response"
	respErr "doctor-manager-api/common/response/error"
	"doctor-manager-api/database/mongo/models"
	"doctor-manager-api/database/mongo/queries"
	"doctor-manager-api/utilities/mongodb"
)

var logger = logging.GetLogger()

type Controller interface {
	Get(ctx *fiber.Ctx) error
	Create(ctx *fiber.Ctx) error
	List(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
}

type controller struct {
}

func New() Controller {
	return &controller{}
}

func (ctrl *controller) Get(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("id"))
	if err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusNotFound, Data: respErr.ErrResourceNotFound})
	}
	queryOption := queries.NewOptions()
	queryOption.SetOnlyFields("created_at", "updated_at", "name", "description", "uri", "db_name", "_id")
	database, err := queries.NewDatabase(ctx.Context()).GetById(id, queryOption)
	if err != nil {
		return err
	}
	return response.New(ctx, response.Options{Data: serializers.DatabaseGetResponse{
		CreatedAt:   database.CreatedAt,
		UpdatedAt:   database.UpdatedAt,
		Name:        database.Name,
		Description: database.Description,
		Uri:         database.Uri,
		DBName:      database.DBName,
		Id:          database.Id,
	}})
}

func (ctrl *controller) Create(ctx *fiber.Ctx) error {
	var requestBody serializers.DatabaseCreateBodyValidate
	if err := ctx.BodyParser(&requestBody); err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: respErr.ErrFieldWrongType})
	}
	if err := requestBody.Validate(); err != nil {
		return err
	}
	queryOption := queries.NewOptions()
	queryOption.SetOnlyFields("_id")
	databaseQuery := queries.NewDatabase(ctx.Context())
	if _, err := databaseQuery.GetByName(requestBody.Name, queryOption); err != nil {
		if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
			return err
		}
	} else {
		return response.NewError(fiber.StatusConflict, response.ErrorOptions{Data: respErr.ErrResourceConflict})
	}
	if requestBody.IsTestConnection {
		if err := mongodb.New().TestConnection(requestBody.Uri); err != nil {
			logger.Error().Err(err).Str("function", "Create").Str("functionInline", "mongodb.New().TestConnection").Msg("database-controller")
			return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Cannot connect to database"})
		}
	}
	// TODO: handle import indexes option
	database, err := databaseQuery.CreateOne(models.Database{
		Name:        requestBody.Name,
		Description: requestBody.Description,
		Uri:         requestBody.Uri,
		DBName:      requestBody.DBName,
	})
	if err != nil {
		return err
	}
	return response.New(ctx, response.Options{
		Code: fiber.StatusCreated,
		Data: fiber.Map{
			"id": database.Id,
		},
	})
}

func (ctrl *controller) List(ctx *fiber.Ctx) error {
	var requestBody serializers.DatabaseListBodyValidate
	if err := ctx.BodyParser(&requestBody); err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: respErr.ErrFieldWrongType})
	}
	if err := requestBody.Validate(); err != nil {
		return err
	}
	var (
		errorChan     = make(chan error, 1)
		totalChan     = make(chan int64, 1)
		queryOption   = queries.NewOptions()
		databaseQuery = queries.NewDatabase(ctx.Context())
		pagination    = request.NewPagination(requestBody.Limit, requestBody.Page)
	)
	go func() {
		total, err := databaseQuery.GetTotalByQuery(requestBody.Query)
		errorChan <- err
		totalChan <- total
	}()
	queryOption.SetPagination(pagination)
	queryOption.AddSortKey(map[string]int{
		"_id": queries.SortTypeDesc,
	})
	queryOption.SetOnlyFields("created_at", "updated_at", "name", "description", "uri", "db_name", "_id")
	databases, err := databaseQuery.GetByQuery(requestBody.Query, queryOption)
	if err != nil {
		return err
	}
	if err = <-errorChan; err != nil {
		return err
	}
	result := make([]serializers.DatabaseListResponseItem, len(databases))
	for i, database := range databases {
		result[i].CreatedAt = database.CreatedAt
		result[i].UpdatedAt = database.UpdatedAt
		result[i].Name = database.Name
		result[i].Description = database.Description
		result[i].Uri = database.Uri
		result[i].DBName = database.DBName
		result[i].Id = database.Id
	}
	pagination.SetTotal(<-totalChan)
	return response.NewArrayWithPagination(ctx, result, pagination)
}

func (ctrl *controller) Update(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("id"))
	if err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusNotFound, Data: respErr.ErrResourceNotFound})
	}
	var requestBody serializers.DatabaseUpdateBodyValidate
	if err = ctx.BodyParser(&requestBody); err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: respErr.ErrFieldWrongType})
	}
	if err = requestBody.Validate(); err != nil {
		return err
	}
	queryOption := queries.NewOptions()
	queryOption.SetOnlyFields("_id")
	databaseQuery := queries.NewDatabase(ctx.Context())
	if _, err := databaseQuery.GetByName(requestBody.Name, queryOption); err != nil {
		if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
			return err
		}
	} else {
		return response.NewError(fiber.StatusConflict, response.ErrorOptions{Data: respErr.ErrResourceConflict})
	}
	if requestBody.IsTestConnection {
		if err := mongodb.New().TestConnection(requestBody.Uri); err != nil {
			logger.Error().Err(err).Str("function", "Create").Str("functionInline", "mongodb.New().TestConnection").Msg("database-controller")
			return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Cannot connect to database"})
		}
	}
	// TODO: handle import indexes option
	database, err := databaseQuery.CreateOne(models.Database{
		Name:        requestBody.Name,
		Description: requestBody.Description,
		Uri:         requestBody.Uri,
		DBName:      requestBody.DBName,
	})
	if err != nil {
		return err
	}
	return response.New(ctx, response.Options{
		Code: fiber.StatusCreated,
		Data: fiber.Map{
			"id": database.Id,
		},
	})
}
