package index

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"doctor-manager-api/api/serializers"
	"doctor-manager-api/common/request"
	"doctor-manager-api/common/response"
	respErr "doctor-manager-api/common/response/error"
	"doctor-manager-api/database/mongo/models"
	"doctor-manager-api/database/mongo/queries"
)

type Controller interface {
	Create(ctx *fiber.Ctx) error
	Get(ctx *fiber.Ctx) error
	ListByCollection(ctx *fiber.Ctx) error
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
	for i, key := range requestBody.Keys {
		index.Keys[i].Field = key.Field
		index.Keys[i].Value = key.Value
	}
	index.KeySignature = index.GetKeySignature()
	if index.Name == "" {
		index.Name = index.KeySignature
	}
	indexQuery := queries.NewIndex(ctx.Context())
	queryOption.SetOnlyFields("_id")
	if _, err := indexQuery.GetByNameOrKeySignature(index.KeySignature, index.Name, queryOption); err != nil {
		if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
			return err
		}
	} else {
		return response.New(ctx, response.Options{Code: fiber.StatusConflict, Data: respErr.ErrResourceConflict})
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
