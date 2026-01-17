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
	Delete(ctx *fiber.Ctx) error
	ListCollections(ctx *fiber.Ctx) error
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
	var indexes []models.Index
	if requestBody.IsTestConnection || requestBody.IsSyncIndex {
		dbClient, err := mongodb.New(requestBody.Uri)
		if err != nil {
			logger.Error().Err(err).Str("function", "Create").Str("functionInline", "mongodb.New").Msg("database-controller")
			return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Cannot connect to database"})
		}
		if requestBody.IsSyncIndex {
			clientIndexes, err := dbClient.GetIndexesByDbName(requestBody.DBName)
			if err != nil {
				logger.Error().Err(err).Str("function", "CompareByCollections").Str("functionInline", "dbClient.GetIndexesByDbName").Msg("database-controller")
				return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Cannot get indexes from database"})
			}
			indexes = make([]models.Index, 0, len(clientIndexes))
			for _, index := range clientIndexes {
				keys := make([]models.IndexKey, 0, len(index.Keys))
				for _, key := range index.Keys {
					keys = append(keys, models.IndexKey{
						Field: key.Field,
						Value: key.Value,
					})
				}
				indexes = append(indexes, models.Index{
					Options: models.IndexOption{
						ExpireAfterSeconds: index.Options.ExpireAfterSeconds,
						IsUnique:           index.Options.IsUnique,
					},
					Collection:   index.Collection,
					Name:         index.Name,
					KeySignature: index.KeySignature,
					Keys:         keys,
				})
			}
		}
	}
	database, err := databaseQuery.CreateOne(models.Database{
		Name:        requestBody.Name,
		Description: requestBody.Description,
		Uri:         requestBody.Uri,
		DBName:      requestBody.DBName,
	})
	if err != nil {
		return err
	}
	for i := range indexes {
		indexes[i].DatabaseId = database.Id
	}
	if err = queries.NewIndex(ctx.Context()).CreateMany(indexes); err != nil {
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
		err           error
		databases     = make([]models.Database, 0)
		errorChan     = make(chan error, 1)
		totalChan     = make(chan int64, 1)
		queryOption   = queries.NewOptions()
		databaseQuery = queries.NewDatabase(ctx.Context())
		pagination    = request.NewPagination(requestBody.Limit, requestBody.Page)
		result        = make([]serializers.DatabaseListResponseItem, 0)
	)
	queryOption.SetPagination(pagination)
	queryOption.AddSortKey(map[string]int{
		"_id": queries.SortTypeDesc,
	})
	queryOption.SetOnlyFields("created_at", "updated_at", "name", "description", "uri", "db_name", "_id")
	if requestBody.Query != "" {
		if id, _ := primitive.ObjectIDFromHex(requestBody.Query); !id.IsZero() {
			database, err := databaseQuery.GetById(id, queryOption)
			if err != nil {
				if e := new(response.Error); errors.As(err, &e) && e.Code == fiber.StatusNotFound {
					return response.NewArrayWithPagination(ctx, result, pagination)
				}
				return err
			}
			return response.NewArrayWithPagination(ctx, []serializers.DatabaseListResponseItem{{
				CreatedAt:   database.CreatedAt,
				UpdatedAt:   database.UpdatedAt,
				Name:        database.Name,
				Description: database.Description,
				Uri:         database.Uri,
				DBName:      database.DBName,
				Id:          database.Id,
			}}, pagination)
		}
		go func() {
			total, err := databaseQuery.GetTotalByQuery(requestBody.Query)
			errorChan <- err
			totalChan <- total
		}()
		databases, err = databaseQuery.GetByQuery(requestBody.Query, queryOption)
	} else {
		go func() {
			total, err := databaseQuery.GetTotal()
			errorChan <- err
			totalChan <- total
		}()
		databases, err = databaseQuery.GetAll(queryOption)
	}
	if err != nil {
		return err
	}
	if err = <-errorChan; err != nil {
		return err
	}
	result = make([]serializers.DatabaseListResponseItem, len(databases))
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
	databaseQuery := queries.NewDatabase(ctx.Context())
	queryOption.SetOnlyFields("name", "uri", "db_name", "description")
	database, err := databaseQuery.GetById(id, queryOption)
	if err != nil {
		return err
	}
	if database.Name == requestBody.Name && database.Description == requestBody.Description &&
		database.Uri == requestBody.Uri && database.DBName == requestBody.DBName {
		return response.New(ctx, response.Options{Data: fiber.Map{"success": true}})
	}
	if database.Name != requestBody.Name {
		if _, err = databaseQuery.GetByName(requestBody.Name, queryOption); err != nil {
			if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
				return err
			}
		} else {
			return response.NewError(fiber.StatusConflict, response.ErrorOptions{Data: respErr.ErrResourceConflict})
		}
	}
	if database.Uri != requestBody.Uri && requestBody.IsTestConnection {
		if _, err = mongodb.New(requestBody.Uri); err != nil {
			logger.Error().Err(err).Str("function", "Update").Str("functionInline", "mongodb.New").Msg("database-controller")
			return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Cannot connect to database"})
		}
	}
	if err = databaseQuery.UpdateInfoById(id, queries.DatabaseUpdateInfoByIdRequest{
		Name:        requestBody.Name,
		Description: requestBody.Description,
		Uri:         requestBody.Uri,
		DBName:      requestBody.DBName,
	}); err != nil {
		return err
	}
	return response.New(ctx, response.Options{Data: fiber.Map{"success": true}})
}

func (ctrl *controller) ListCollections(ctx *fiber.Ctx) error {
	var requestBody serializers.DatabaseListCollectionsBodyValidate
	if err := ctx.BodyParser(&requestBody); err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: respErr.ErrFieldWrongType})
	}
	if err := requestBody.Validate(); err != nil {
		return err
	}
	var (
		errorChan   = make(chan error, 1)
		totalChan   = make(chan int, 1)
		queryOption = queries.NewOptions()
		indexQuery  = queries.NewIndex(ctx.Context())
		pagination  = request.NewPagination(requestBody.Limit, requestBody.Page)
		result      = make([]serializers.DatabaseListCollectionsResponseItem, 0)
	)
	queryOption.SetOnlyFields("_id")
	if _, err := queries.NewDatabase(ctx.Context()).GetById(requestBody.DatabaseId, queryOption); err != nil {
		return err
	}
	go func() {
		total, err := indexQuery.GetTotalCollectionsByDatabaseIdAndQuery(requestBody.DatabaseId, requestBody.Query)
		errorChan <- err
		totalChan <- total
	}()
	queryOption.SetPagination(pagination)
	queryOption.AddSortKey(map[string]int{
		"_id": queries.SortTypeAsc,
	})
	collections, err := indexQuery.GetCollectionsByDatabaseIdAndQuery(requestBody.DatabaseId, requestBody.Query, queryOption)
	if err != nil {
		return err
	}
	if err = <-errorChan; err != nil {
		return err
	}
	result = make([]serializers.DatabaseListCollectionsResponseItem, len(collections))
	for i, collection := range collections {
		result[i].Collection = collection.Collection
		result[i].TotalIndexes = collection.TotalIndexes
	}
	pagination.SetTotal(int64(<-totalChan))
	return response.NewArrayWithPagination(ctx, result, pagination)
}

func (ctrl *controller) Delete(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("id"))
	if err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusNotFound, Data: respErr.ErrResourceNotFound})
	}
	queryOption := queries.NewOptions()
	databaseQuery := queries.NewDatabase(ctx.Context())
	queryOption.SetOnlyFields("_id")
	if _, err = databaseQuery.GetById(id, queryOption); err != nil {
		if e := new(response.Error); errors.As(err, &e) && e.Code == fiber.StatusNotFound {
			return response.New(ctx, response.Options{Data: fiber.Map{"success": true}})
		}
		return err
	}
	syncQuery := queries.NewSync(ctx.Context())
	queryOption.SetOnlyFields("_id")
	if _, err = syncQuery.GetByDatabaseIdAndIsFinished(id, false, queryOption); err != nil {
		if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
			return err
		}
	} else {
		return response.New(ctx, response.Options{Code: fiber.StatusConflict, Data: respErr.ErrResourceConflict})
	}
	if err = databaseQuery.DeleteById(id); err != nil {
		return err
	}
	var (
		totalTask = 1
		errorChan = make(chan error, totalTask)
	)
	go func() {
		err = queries.NewIndex(ctx.Context()).DeleteByDatabaseId(id)
		errorChan <- err
	}()
	for range totalTask {
		if err = <-errorChan; err != nil {
			return err
		}
	}
	return response.New(ctx, response.Options{Data: fiber.Map{"success": true}})
}
