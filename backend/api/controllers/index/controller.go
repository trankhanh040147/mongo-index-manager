package index

import (
	"errors"
	"reflect"
	"slices"

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
	Create(ctx *fiber.Ctx) error
	Get(ctx *fiber.Ctx) error
	ListByCollection(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
	CompareByCollections(ctx *fiber.Ctx) error
}

type controller struct {
}

func New() Controller {
	return &controller{}
}

func (ctrl *controller) Create(ctx *fiber.Ctx) error {
	var requestBody serializers.IndexCreateBodyValidate
	if err := ctx.BodyParser(&requestBody); err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: respErr.ErrFieldWrongType})
	}
	if err := requestBody.Validate(); err != nil {
		return err
	}
	queryOption := queries.NewOptions()
	queryOption.SetOnlyFields("uri")
	if _, err := queries.NewDatabase(ctx.Context()).GetById(requestBody.DatabaseId, queryOption); err != nil {
		return err
	}
	index := &models.Index{
		Options: models.IndexOption{
			ExpireAfterSeconds: requestBody.Options.ExpireAfterSeconds,
			IsUnique:           requestBody.Options.IsUnique,
		},
		Collection: requestBody.Collection,
		Name:       requestBody.Name,
		Keys:       make([]models.IndexKey, len(requestBody.Keys)),
		DatabaseId: requestBody.DatabaseId,
	}
	keyFields := make([]string, len(index.Keys))
	for i, key := range requestBody.Keys {
		index.Keys[i].Field = key.Field
		index.Keys[i].Value = key.Value
		keyFields[i] = key.Field
	}
	index.KeySignature = index.GetKeySignature()
	if index.Name == "" {
		index.Name = index.KeySignature
	}
	indexQuery := queries.NewIndex(ctx.Context())
	queryOption.SetOnlyFields("_id")
	if _, err := indexQuery.GetByDatabaseIdCollectionWithNameOrSignature(requestBody.DatabaseId, requestBody.Collection, index.KeySignature, index.Name, queryOption); err != nil {
		if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
			return err
		}
	} else {
		return response.New(ctx, response.Options{Code: fiber.StatusConflict, Data: respErr.ErrResourceConflict})
	}
	if requestBody.Options.IsUnique {
		if _, err := indexQuery.GetByDatabaseIdCollectionKeyFieldsAndIsUnique(requestBody.DatabaseId, requestBody.Collection, keyFields, true, queryOption); err != nil {
			if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
				return err
			}
		} else {
			return response.New(ctx, response.Options{Code: fiber.StatusConflict, Data: respErr.ErrResourceConflict})
		}
	}
	newIndex, err := indexQuery.CreateOne(*index)
	if err != nil {
		return err
	}
	return response.New(ctx, response.Options{Code: fiber.StatusCreated, Data: fiber.Map{
		"id": newIndex.Id,
	}})
}

func (ctrl *controller) Get(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("id"))
	if err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusNotFound, Data: respErr.ErrResourceNotFound})
	}
	queryOption := queries.NewOptions()
	queryOption.SetOnlyFields("created_at", "updated_at", "options", "collection", "name", "key_signature", "keys", "_id", "database_id")
	index, err := queries.NewIndex(ctx.Context()).GetById(id, queryOption)
	if err != nil {
		return err
	}
	keys := make([]serializers.IndexGetResponseKey, len(index.Keys))
	for i, key := range index.Keys {
		keys[i].Field = key.Field
		keys[i].Value = key.Value
	}
	return response.New(ctx, response.Options{Data: serializers.IndexGetResponse{
		CreatedAt: index.CreatedAt,
		UpdatedAt: index.UpdatedAt,
		Options: serializers.IndexGetResponseOption{
			ExpireAfterSeconds: index.Options.ExpireAfterSeconds,
			IsUnique:           index.Options.IsUnique,
		},
		Collection:   index.Collection,
		Name:         index.Name,
		KeySignature: index.KeySignature,
		Keys:         keys,
		Id:           id,
		DatabaseId:   index.DatabaseId,
	}})
}

func (ctrl *controller) ListByCollection(ctx *fiber.Ctx) error {
	var requestBody serializers.IndexListByCollectionBodyValidate
	if err := ctx.BodyParser(&requestBody); err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: respErr.ErrFieldWrongType})
	}
	if err := requestBody.Validate(); err != nil {
		return err
	}
	var (
		err         error
		indexes     = make([]models.Index, 0)
		errorChan   = make(chan error, 1)
		totalChan   = make(chan int64, 1)
		queryOption = queries.NewOptions()
		indexQuery  = queries.NewIndex(ctx.Context())
		pagination  = request.NewPagination(requestBody.Limit, requestBody.Page)
		result      = make([]serializers.IndexListByCollectionResponseItem, 0)
	)
	queryOption.SetPagination(pagination)
	queryOption.AddSortKey(map[string]int{
		"_id": queries.SortTypeDesc,
	})
	queryOption.SetOnlyFields("created_at", "updated_at", "options", "collection", "name", "key_signature", "keys", "_id", "database_id")
	if requestBody.Query != "" {
		if id, _ := primitive.ObjectIDFromHex(requestBody.Query); !id.IsZero() {
			index, err := indexQuery.GetById(id, queryOption)
			if err != nil {
				if e := new(response.Error); errors.As(err, &e) && e.Code == fiber.StatusNotFound {
					return response.NewArrayWithPagination(ctx, result, pagination)
				}
				return err
			}
			keys := make([]serializers.IndexListByCollectionResponseKey, len(index.Keys))
			for i, key := range index.Keys {
				keys[i].Field = key.Field
				keys[i].Value = key.Value
			}
			return response.NewArrayWithPagination(ctx, []serializers.IndexListByCollectionResponseItem{{
				CreatedAt: index.CreatedAt,
				UpdatedAt: index.UpdatedAt,
				Options: serializers.IndexListByCollectionResponseOption{
					ExpireAfterSeconds: index.Options.ExpireAfterSeconds,
					IsUnique:           index.Options.IsUnique,
				},
				Collection:   index.Collection,
				Name:         index.Name,
				KeySignature: index.KeySignature,
				Keys:         keys,
				Id:           id,
				DatabaseId:   index.DatabaseId,
			}}, pagination)
		}
		go func() {
			total, err := indexQuery.GetTotalByDatabaseIdCollectionAndQuery(requestBody.DatabaseId, requestBody.Collection, requestBody.Query)
			errorChan <- err
			totalChan <- total
		}()
		indexes, err = indexQuery.GetByDatabaseIdCollectionAndQuery(requestBody.DatabaseId, requestBody.Collection, requestBody.Query, queryOption)
	} else {
		go func() {
			total, err := indexQuery.GetTotalByDatabaseIdAndCollection(requestBody.DatabaseId, requestBody.Collection)
			errorChan <- err
			totalChan <- total
		}()
		indexes, err = indexQuery.GetByDatabaseIdAndCollection(requestBody.DatabaseId, requestBody.Collection, queryOption)
	}
	if err != nil {
		return err
	}
	if err = <-errorChan; err != nil {
		return err
	}
	result = make([]serializers.IndexListByCollectionResponseItem, len(indexes))
	for i, index := range indexes {
		keys := make([]serializers.IndexListByCollectionResponseKey, len(index.Keys))
		for idx, key := range index.Keys {
			keys[idx].Field = key.Field
			keys[idx].Value = key.Value
		}
		result[i].CreatedAt = index.CreatedAt
		result[i].UpdatedAt = index.UpdatedAt
		result[i].Options.IsUnique = index.Options.IsUnique
		result[i].Options.ExpireAfterSeconds = index.Options.ExpireAfterSeconds
		result[i].Collection = index.Collection
		result[i].Name = index.Name
		result[i].KeySignature = index.KeySignature
		result[i].Keys = keys
		result[i].Id = index.Id
		result[i].DatabaseId = index.DatabaseId
	}
	pagination.SetTotal(<-totalChan)
	return response.NewArrayWithPagination(ctx, result, pagination)
}

func (ctrl *controller) Update(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("id"))
	if err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusNotFound, Data: respErr.ErrResourceNotFound})
	}
	var requestBody serializers.IndexUpdateBodyValidate
	if err = ctx.BodyParser(&requestBody); err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: respErr.ErrFieldWrongType})
	}
	if err = requestBody.Validate(); err != nil {
		return err
	}
	queryOption := queries.NewOptions()
	indexQuery := queries.NewIndex(ctx.Context())
	queryOption.SetOnlyFields("name", "keys", "collection", "options", "key_signature", "database_id", "collection")
	index, err := indexQuery.GetById(id, queryOption)
	if err != nil {
		return err
	}
	indexUpdate := models.Index{
		Name: requestBody.Name,
		Options: models.IndexOption{
			ExpireAfterSeconds: requestBody.Options.ExpireAfterSeconds,
			IsUnique:           requestBody.Options.IsUnique,
		},
		Keys: make([]models.IndexKey, len(requestBody.Keys)),
	}
	isSameKeyFields := true
	listKeyFieldsUpdate := make([]string, len(requestBody.Keys))
	mapKeyField := make(map[string]struct{}, len(index.Keys))
	for _, key := range index.Keys {
		mapKeyField[key.Field] = struct{}{}
	}
	for i, key := range requestBody.Keys {
		indexUpdate.Keys[i].Field = key.Field
		indexUpdate.Keys[i].Value = key.Value
		listKeyFieldsUpdate[i] = key.Field
		if _, exists := mapKeyField[key.Field]; !exists {
			isSameKeyFields = false
		}
	}
	if index.Name == requestBody.Name && reflect.DeepEqual(index.Options, indexUpdate.Options) && slices.Equal(index.Keys, indexUpdate.Keys) {
		return response.New(ctx, response.Options{Data: fiber.Map{"success": true}})
	}
	indexUpdate.KeySignature = indexUpdate.GetKeySignature()
	if indexUpdate.Name == "" {
		indexUpdate.Name = indexUpdate.KeySignature
	}
	queryOption.SetOnlyFields("_id")
	if index.Name != indexUpdate.Name || index.KeySignature != indexUpdate.KeySignature {
		if _, err = indexQuery.GetByDatabaseIdCollectionWithNameOrSignature(index.DatabaseId, index.Collection, indexUpdate.Name, indexUpdate.KeySignature, queryOption); err != nil {
			if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
				return err
			}
		} else {
			return response.NewError(fiber.StatusConflict, response.ErrorOptions{Data: respErr.ErrResourceConflict})
		}
	}
	if requestBody.Options.IsUnique && !isSameKeyFields {
		if _, err = indexQuery.GetByDatabaseIdCollectionKeyFieldsAndIsUnique(index.DatabaseId, index.Collection, listKeyFieldsUpdate, true, queryOption); err != nil {
			if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
				return err
			}
		} else {
			return response.New(ctx, response.Options{Code: fiber.StatusConflict, Data: respErr.ErrResourceConflict})
		}
	}
	if err = indexQuery.UpdateNameKeySignatureOptionsKeysById(id, indexUpdate.Name, indexUpdate.KeySignature, indexUpdate.Options, indexUpdate.Keys); err != nil {
		return err
	}
	return response.New(ctx, response.Options{Data: fiber.Map{"success": true}})
}

func (ctrl *controller) Delete(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("id"))
	if err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusNotFound, Data: respErr.ErrResourceNotFound})
	}
	queryOption := queries.NewOptions()
	indexQuery := queries.NewIndex(ctx.Context())
	queryOption.SetOnlyFields("_id")
	if _, err = indexQuery.GetById(id, queryOption); err != nil {
		if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
			return err
		}
		return response.New(ctx, response.Options{Data: fiber.Map{"success": true}})
	}
	if err = indexQuery.DeleteById(id); err != nil {
		if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
			return err
		}
	}
	return response.New(ctx, response.Options{Data: fiber.Map{"success": true}})
}

func (ctrl *controller) CompareByCollections(ctx *fiber.Ctx) error {
	var requestBody serializers.IndexCompareByCollectionsValidate
	if err := ctx.BodyParser(&requestBody); err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: respErr.ErrFieldWrongType})
	}
	if err := requestBody.Validate(); err != nil {
		return err
	}
	queryOption := queries.NewOptions()
	queryOption.SetOnlyFields("uri", "db_name")
	database, err := queries.NewDatabase(ctx.Context()).GetById(requestBody.DatabaseId, queryOption)
	if err != nil {
		return err
	}
	indexQuery := queries.NewIndex(ctx.Context())
	queryOption.SetOnlyFields("options", "keys")
	indexes, err := indexQuery.GetByDatabaseIdAndCollections(requestBody.DatabaseId, requestBody.Collections, queryOption)
	if err != nil {
		return err
	}
	dbClient, err := mongodb.New(database.Uri)
	if err != nil {
		logger.Error().Err(err).Str("function", "CompareByCollections").Str("functionInline", "mongodb.New").Msg("index-controller")
		return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Cannot connect to database"})
	}
	clientIndexes, err := dbClient.GetIndexesByDbNameAndCollections(database.DBName, requestBody.Collections)
	if err != nil {
		logger.Error().Err(err).Str("function", "CompareByCollections").Str("functionInline", "dbClient.GetIndexesByDbNameAndCollections").Msg("index-controller")
		return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Cannot get indexes from database"})
	}
	// todo: compare indexes between two
	return response.New(ctx, response.Options{Data: fiber.Map{"success": true}})
}
