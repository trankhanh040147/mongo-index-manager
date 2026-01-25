package index

import (
	"errors"
	"reflect"
	"slices"
	"time"

	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"doctor-manager-api/api/serializers"
	"doctor-manager-api/common/constants"
	"doctor-manager-api/common/logging"
	"doctor-manager-api/common/request"
	"doctor-manager-api/common/response"
	respErr "doctor-manager-api/common/response/error"
	"doctor-manager-api/database/mongo/models"
	"doctor-manager-api/database/mongo/queries"
	"doctor-manager-api/job"
	"doctor-manager-api/utilities/mongodb"
	"doctor-manager-api/utilities/taskqueue"
)

var logger = logging.GetLogger()

type Controller interface {
	Create(ctx *fiber.Ctx) error
	Get(ctx *fiber.Ctx) error
	ListByCollection(ctx *fiber.Ctx) error
	Update(ctx *fiber.Ctx) error
	Delete(ctx *fiber.Ctx) error
	CompareByCollections(ctx *fiber.Ctx) error
	CompareByDatabase(ctx *fiber.Ctx) error
	SyncByCollections(ctx *fiber.Ctx) error
	GetSyncStatus(ctx *fiber.Ctx) error
	GetSyncStatusByDatabase(ctx *fiber.Ctx) error
	SyncFromDatabase(ctx *fiber.Ctx) error
	SyncByDatabase(ctx *fiber.Ctx) error
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
	var collation *models.Collation
	if requestBody.Options.Collation != nil {
		collation = &models.Collation{
			Locale:          requestBody.Options.Collation.Locale,
			Strength:        requestBody.Options.Collation.Strength,
			CaseLevel:       requestBody.Options.Collation.CaseLevel,
			CaseFirst:       requestBody.Options.Collation.CaseFirst,
			NumericOrdering: requestBody.Options.Collation.NumericOrdering,
		}
	}
	index := &models.Index{
		Options: models.IndexOption{
			ExpireAfterSeconds: requestBody.Options.ExpireAfterSeconds,
			IsUnique:           requestBody.Options.IsUnique,
			Collation:          collation,
			DefaultLanguage:    requestBody.Options.DefaultLanguage,
			Weights:            requestBody.Options.Weights,
		},
		Collection: requestBody.Collection,
		Name:       requestBody.Name,
		Keys:       make([]models.IndexKey, len(requestBody.Keys)),
		DatabaseId: requestBody.DatabaseId,
	}
	keyFields := make([]string, len(index.Keys))
	for i, key := range requestBody.Keys {
		index.Keys[i].Field = key.Field
		switch v := key.Value.(type) {
		case float64:
			if v == 1 || v == -1 {
				index.Keys[i].Value = int32(v)
			} else {
				index.Keys[i].Value = key.Value
			}
		case int:
			if v == 1 || v == -1 {
				index.Keys[i].Value = int32(v)
			} else {
				index.Keys[i].Value = key.Value
			}
		default:
			index.Keys[i].Value = key.Value
		}
		keyFields[i] = key.Field
	}
	index.IsText = models.IsTextIndex(index.Keys)
	if index.IsText && index.Options.DefaultLanguage == "" {
		index.Options.DefaultLanguage = "none"
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
	var collationResp *serializers.CollationGetResponse
	if index.Options.Collation != nil {
		collationResp = &serializers.CollationGetResponse{
			Locale:          index.Options.Collation.Locale,
			Strength:        index.Options.Collation.Strength,
			CaseLevel:       index.Options.Collation.CaseLevel,
			CaseFirst:       index.Options.Collation.CaseFirst,
			NumericOrdering: index.Options.Collation.NumericOrdering,
		}
	}
	return response.New(ctx, response.Options{Data: serializers.IndexGetResponse{
		CreatedAt: index.CreatedAt,
		UpdatedAt: index.UpdatedAt,
		Options: serializers.IndexGetResponseOption{
			ExpireAfterSeconds: index.Options.ExpireAfterSeconds,
			IsUnique:           index.Options.IsUnique,
			Collation:          collationResp,
			DefaultLanguage:    index.Options.DefaultLanguage,
			Weights:            index.Options.Weights,
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
			var collationResp *serializers.CollationGetResponse
			if index.Options.Collation != nil {
				collationResp = &serializers.CollationGetResponse{
					Locale:          index.Options.Collation.Locale,
					Strength:        index.Options.Collation.Strength,
					CaseLevel:       index.Options.Collation.CaseLevel,
					CaseFirst:       index.Options.Collation.CaseFirst,
					NumericOrdering: index.Options.Collation.NumericOrdering,
				}
			}
			return response.NewArrayWithPagination(ctx, []serializers.IndexListByCollectionResponseItem{{
				CreatedAt: index.CreatedAt,
				UpdatedAt: index.UpdatedAt,
				Options: serializers.IndexListByCollectionResponseOption{
					ExpireAfterSeconds: index.Options.ExpireAfterSeconds,
					IsUnique:           index.Options.IsUnique,
					Collation:          collationResp,
					DefaultLanguage:    index.Options.DefaultLanguage,
					Weights:            index.Options.Weights,
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
		var collationResp *serializers.CollationGetResponse
		if index.Options.Collation != nil {
			collationResp = &serializers.CollationGetResponse{
				Locale:          index.Options.Collation.Locale,
				Strength:        index.Options.Collation.Strength,
				CaseLevel:       index.Options.Collation.CaseLevel,
				CaseFirst:       index.Options.Collation.CaseFirst,
				NumericOrdering: index.Options.Collation.NumericOrdering,
			}
		}
		result[i].CreatedAt = index.CreatedAt
		result[i].UpdatedAt = index.UpdatedAt
		result[i].Options.IsUnique = index.Options.IsUnique
		result[i].Options.ExpireAfterSeconds = index.Options.ExpireAfterSeconds
		result[i].Options.Collation = collationResp
		result[i].Options.DefaultLanguage = index.Options.DefaultLanguage
		result[i].Options.Weights = index.Options.Weights
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
	var collation *models.Collation
	if requestBody.Options.Collation != nil {
		collation = &models.Collation{
			Locale:          requestBody.Options.Collation.Locale,
			Strength:        requestBody.Options.Collation.Strength,
			CaseLevel:       requestBody.Options.Collation.CaseLevel,
			CaseFirst:       requestBody.Options.Collation.CaseFirst,
			NumericOrdering: requestBody.Options.Collation.NumericOrdering,
		}
	}
	indexUpdate := models.Index{
		Name: requestBody.Name,
		Options: models.IndexOption{
			ExpireAfterSeconds: requestBody.Options.ExpireAfterSeconds,
			IsUnique:           requestBody.Options.IsUnique,
			Collation:          collation,
			DefaultLanguage:    requestBody.Options.DefaultLanguage,
			Weights:            requestBody.Options.Weights,
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
		switch v := key.Value.(type) {
		case float64:
			if v == 1 || v == -1 {
				indexUpdate.Keys[i].Value = int32(v)
			} else {
				indexUpdate.Keys[i].Value = key.Value
			}
		case int:
			if v == 1 || v == -1 {
				indexUpdate.Keys[i].Value = int32(v)
			} else {
				indexUpdate.Keys[i].Value = key.Value
			}
		default:
			indexUpdate.Keys[i].Value = key.Value
		}
		listKeyFieldsUpdate[i] = key.Field
		if _, exists := mapKeyField[key.Field]; !exists {
			isSameKeyFields = false
		}
	}
	if index.Name == requestBody.Name && reflect.DeepEqual(index.Options, indexUpdate.Options) && slices.Equal(index.Keys, indexUpdate.Keys) {
		return response.New(ctx, response.Options{Data: fiber.Map{"success": true}})
	}
	indexUpdate.IsText = models.IsTextIndex(indexUpdate.Keys)
	if indexUpdate.IsText && indexUpdate.Options.DefaultLanguage == "" {
		indexUpdate.Options.DefaultLanguage = "none"
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
	queryOption.SetOnlyFields("options", "keys", "key_signature", "collection", "name")
	indexes, err := indexQuery.GetByDatabaseIdAndCollections(requestBody.DatabaseId, requestBody.Collections, queryOption)
	if err != nil {
		return err
	}
	mapIndexManager := make(map[string]map[string]models.Index)
	for _, index := range indexes {
		if _, exists := mapIndexManager[index.Collection]; !exists {
			mapIndexManager[index.Collection] = make(map[string]models.Index)
		}
		mapIndexManager[index.Collection][index.KeySignature] = index
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
	mapIndexClient := make(map[string]map[string]mongodb.Index)
	for _, index := range clientIndexes {
		if _, exists := mapIndexClient[index.Collection]; !exists {
			mapIndexClient[index.Collection] = make(map[string]mongodb.Index)
		}
		mapIndexClient[index.Collection][index.KeySignature] = index
	}
	result := make([]serializers.IndexCompareByCollectionsResponseItem, 0, len(requestBody.Collections))
	for _, collection := range requestBody.Collections {
		compareItem := serializers.IndexCompareByCollectionsResponseItem{
			Collection:       collection,
			MissingIndexes:   make([]serializers.IndexCompareByCollectionsIndex, 0),
			MatchedIndexes:   make([]serializers.IndexCompareByCollectionsIndex, 0),
			RedundantIndexes: make([]serializers.IndexCompareByCollectionsIndex, 0),
		}
		for _, index := range mapIndexManager[collection] {
			keys := make([]serializers.IndexCompareByCollectionsIndexKey, len(index.Keys))
			for i, key := range index.Keys {
				keys[i].Field = key.Field
				keys[i].Value = key.Value
			}
			var collationResp *serializers.CollationGetResponse
			if index.Options.Collation != nil {
				collationResp = &serializers.CollationGetResponse{
					Locale:          index.Options.Collation.Locale,
					Strength:        index.Options.Collation.Strength,
					CaseLevel:       index.Options.Collation.CaseLevel,
					CaseFirst:       index.Options.Collation.CaseFirst,
					NumericOrdering: index.Options.Collation.NumericOrdering,
				}
			}
			indexItem := serializers.IndexCompareByCollectionsIndex{
				Options: serializers.IndexCompareByCollectionsIndexOption{
					ExpireAfterSeconds: index.Options.ExpireAfterSeconds,
					IsUnique:           index.Options.IsUnique,
					Collation:          collationResp,
					DefaultLanguage:    index.Options.DefaultLanguage,
					Weights:            index.Options.Weights,
				},
				Name: index.Name,
				Keys: keys,
			}
			if _, exists := mapIndexClient[collection][index.KeySignature]; exists {
				compareItem.MatchedIndexes = append(compareItem.MatchedIndexes, indexItem)
				delete(mapIndexClient[collection], index.KeySignature)
			} else {
				compareItem.MissingIndexes = append(compareItem.MissingIndexes, indexItem)
			}
		}
		for _, index := range mapIndexClient[collection] {
			keys := make([]serializers.IndexCompareByCollectionsIndexKey, len(index.Keys))
			for i, key := range index.Keys {
				keys[i].Field = key.Field
				keys[i].Value = key.Value
			}
			var collationResp *serializers.CollationGetResponse
			if index.Options.Collation != nil {
				collationResp = &serializers.CollationGetResponse{
					Locale:          index.Options.Collation.Locale,
					Strength:        index.Options.Collation.Strength,
					CaseLevel:       index.Options.Collation.CaseLevel,
					CaseFirst:       index.Options.Collation.CaseFirst,
					NumericOrdering: index.Options.Collation.NumericOrdering,
				}
			}
			compareItem.RedundantIndexes = append(compareItem.RedundantIndexes, serializers.IndexCompareByCollectionsIndex{
				Options: serializers.IndexCompareByCollectionsIndexOption{
					ExpireAfterSeconds: index.Options.ExpireAfterSeconds,
					IsUnique:           index.Options.IsUnique,
					Collation:          collationResp,
					DefaultLanguage:    index.Options.DefaultLanguage,
					Weights:            index.Options.Weights,
				},
				Name: index.Name,
				Keys: keys,
			})
		}
		result = append(result, compareItem)
	}
	return response.NewArrayWithPagination(ctx, result, &request.Pagination{})
}

func (ctrl *controller) CompareByDatabase(ctx *fiber.Ctx) error {
	var requestBody serializers.IndexCompareByDatabaseValidate
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
	queryOption.SetOnlyFields("options", "keys", "key_signature", "collection", "name")
	indexes, err := indexQuery.GetByDatabaseId(requestBody.DatabaseId, queryOption)
	if err != nil {
		return err
	}
	collections := make([]string, 0)
	mapCollection := make(map[string]struct{})
	mapIndexManager := make(map[string]map[string]models.Index)
	for _, index := range indexes {
		if _, exists := mapCollection[index.Collection]; !exists {
			collections = append(collections, index.Collection)
			mapCollection[index.Collection] = struct{}{}
		}
		if _, exists := mapIndexManager[index.Collection]; !exists {
			mapIndexManager[index.Collection] = make(map[string]models.Index)
		}
		mapIndexManager[index.Collection][index.KeySignature] = index
	}

	dbClient, err := mongodb.New(database.Uri)
	if err != nil {
		logger.Error().Err(err).Str("function", "CompareByCollections").Str("functionInline", "mongodb.New").Msg("index-controller")
		return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Cannot connect to database"})
	}
	clientIndexes, err := dbClient.GetIndexesByDbNameAndCollections(database.DBName, collections)
	if err != nil {
		logger.Error().Err(err).Str("function", "CompareByCollections").Str("functionInline", "dbClient.GetIndexesByDbNameAndCollections").Msg("index-controller")
		return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Cannot get indexes from database"})
	}
	mapIndexClient := make(map[string]map[string]mongodb.Index)
	for _, index := range clientIndexes {
		if _, exists := mapIndexClient[index.Collection]; !exists {
			mapIndexClient[index.Collection] = make(map[string]mongodb.Index)
		}
		mapIndexClient[index.Collection][index.KeySignature] = index
	}
	result := make([]serializers.IndexCompareByDatabaseResponseItem, 0, len(collections))
	for _, collection := range collections {
		compareItem := serializers.IndexCompareByDatabaseResponseItem{
			Collection:       collection,
			MissingIndexes:   make([]serializers.IndexCompareByDatabaseIndex, 0),
			MatchedIndexes:   make([]serializers.IndexCompareByDatabaseIndex, 0),
			RedundantIndexes: make([]serializers.IndexCompareByDatabaseIndex, 0),
		}
		for _, index := range mapIndexManager[collection] {
			keys := make([]serializers.IndexCompareByDatabaseIndexKey, len(index.Keys))
			for i, key := range index.Keys {
				keys[i].Field = key.Field
				keys[i].Value = key.Value
			}
			var collationResp *serializers.CollationGetResponse
			if index.Options.Collation != nil {
				collationResp = &serializers.CollationGetResponse{
					Locale:          index.Options.Collation.Locale,
					Strength:        index.Options.Collation.Strength,
					CaseLevel:       index.Options.Collation.CaseLevel,
					CaseFirst:       index.Options.Collation.CaseFirst,
					NumericOrdering: index.Options.Collation.NumericOrdering,
				}
			}
			indexItem := serializers.IndexCompareByDatabaseIndex{
				Options: serializers.IndexCompareByDatabaseIndexOption{
					ExpireAfterSeconds: index.Options.ExpireAfterSeconds,
					IsUnique:           index.Options.IsUnique,
					Collation:          collationResp,
					DefaultLanguage:    index.Options.DefaultLanguage,
					Weights:            index.Options.Weights,
				},
				Name: index.Name,
				Keys: keys,
			}
			if _, exists := mapIndexClient[collection][index.KeySignature]; exists {
				compareItem.MatchedIndexes = append(compareItem.MatchedIndexes, indexItem)
				delete(mapIndexClient[collection], index.KeySignature)
			} else {
				compareItem.MissingIndexes = append(compareItem.MissingIndexes, indexItem)
			}
		}
		for _, index := range mapIndexClient[collection] {
			keys := make([]serializers.IndexCompareByDatabaseIndexKey, len(index.Keys))
			for i, key := range index.Keys {
				keys[i].Field = key.Field
				keys[i].Value = key.Value
			}
			var collationResp *serializers.CollationGetResponse
			if index.Options.Collation != nil {
				collationResp = &serializers.CollationGetResponse{
					Locale:          index.Options.Collation.Locale,
					Strength:        index.Options.Collation.Strength,
					CaseLevel:       index.Options.Collation.CaseLevel,
					CaseFirst:       index.Options.Collation.CaseFirst,
					NumericOrdering: index.Options.Collation.NumericOrdering,
				}
			}
			compareItem.RedundantIndexes = append(compareItem.RedundantIndexes, serializers.IndexCompareByDatabaseIndex{
				Options: serializers.IndexCompareByDatabaseIndexOption{
					ExpireAfterSeconds: index.Options.ExpireAfterSeconds,
					IsUnique:           index.Options.IsUnique,
					Collation:          collationResp,
					DefaultLanguage:    index.Options.DefaultLanguage,
					Weights:            index.Options.Weights,
				},
				Name: index.Name,
				Keys: keys,
			})
		}
		result = append(result, compareItem)
	}
	return response.NewArrayWithPagination(ctx, result, &request.Pagination{})
}

func (ctrl *controller) SyncByCollections(ctx *fiber.Ctx) error {
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
	syncQuery := queries.NewSync(ctx.Context())
	queryOption.SetOnlyFields("_id")
	if _, err = syncQuery.GetByDatabaseIdAndIsFinished(requestBody.DatabaseId, false, queryOption); err != nil {
		if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
			return err
		}
	} else {
		return response.New(ctx, response.Options{Code: fiber.StatusConflict, Data: respErr.ErrResourceConflict})
	}

	indexQuery := queries.NewIndex(ctx.Context())
	queryOption.SetOnlyFields("options", "keys", "key_signature", "collection", "name")
	indexes, err := indexQuery.GetByDatabaseIdAndCollections(requestBody.DatabaseId, requestBody.Collections, queryOption)
	if err != nil {
		return err
	}
	mapIndexManager := make(map[string]map[string]models.Index)
	for _, index := range indexes {
		if _, exists := mapIndexManager[index.Collection]; !exists {
			mapIndexManager[index.Collection] = make(map[string]models.Index)
		}
		mapIndexManager[index.Collection][index.KeySignature] = index
	}

	dbClient, err := mongodb.New(database.Uri)
	if err != nil {
		logger.Error().Err(err).Str("function", "CompareByCollections").Str("functionInline", "mongodb.New").Msg("index-controller")
		return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Can't connect to database"})
	}
	clientIndexes, err := dbClient.GetIndexesByDbNameAndCollections(database.DBName, requestBody.Collections)
	if err != nil {
		logger.Error().Err(err).Str("function", "CompareByCollections").Str("functionInline", "dbClient.GetIndexesByDbNameAndCollections").Msg("index-controller")
		return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Can't get indexes from database"})
	}
	sync, err := syncQuery.CreateOne(models.Sync{
		Error:       "",
		Collections: requestBody.Collections,
		DatabaseID:  requestBody.DatabaseId,
		IsFinished:  false,
		Status:      constants.SyncStatusPending,
		Progress:    0,
		StartedAt:   time.Now(),
	})
	if err != nil {
		return err
	}
	payloadData, _ := sonic.Marshal(job.PayloadSyncIndexByCollections{
		Collections:   requestBody.Collections,
		ClientIndexes: clientIndexes,
		ServerIndexes: indexes,
		Uri:           database.Uri,
		DBName:        database.DBName,
		SyncId:        sync.Id,
	})
	taskQueue := taskqueue.GetGlobal()
	if _, err = taskQueue.EnqueueTask(taskQueue.NewTask(taskqueue.TaskTypeSyncIndexByCollection, payloadData)); err != nil {
		logger.Error().Err(err).Str("function", "CompareByCollections").Str("functionInline", "jobQueue.EnqueueTask").Msg("index-controller")
		_ = syncQuery.UpdateStatusById(sync.Id, constants.SyncStatusFailed, 0, "Failed to enqueue job")
		return response.NewError(fiber.StatusInternalServerError)
	}
	return response.New(ctx, response.Options{Data: fiber.Map{"success": true}})
}

func (ctrl *controller) GetSyncStatus(ctx *fiber.Ctx) error {
	id, err := primitive.ObjectIDFromHex(ctx.Params("sync_id"))
	if err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusNotFound, Data: respErr.ErrResourceNotFound})
	}
	queryOption := queries.NewOptions()
	sync, err := queries.NewSync(ctx.Context()).GetById(id, queryOption)
	if err != nil {
		return err
	}
	return response.New(ctx, response.Options{Data: serializers.IndexSyncStatusResponse{
		Id:          sync.Id,
		DatabaseId:  sync.DatabaseID,
		Status:      sync.Status,
		Progress:    sync.Progress,
		Error:       sync.Error,
		Collections: sync.Collections,
		IsFinished:  sync.IsFinished,
		StartedAt:   sync.StartedAt,
		CompletedAt: sync.CompletedAt,
		CreatedAt:   sync.CreatedAt,
		UpdatedAt:   sync.UpdatedAt,
	}})
}

func (ctrl *controller) GetSyncStatusByDatabase(ctx *fiber.Ctx) error {
	databaseId, err := primitive.ObjectIDFromHex(ctx.Params("database_id"))
	if err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusNotFound, Data: respErr.ErrResourceNotFound})
	}
	queryOption := queries.NewOptions()
	queryOption.AddSortKey(map[string]int{
		"created_at": queries.SortTypeDesc,
	})
	syncs, err := queries.NewSync(ctx.Context()).GetByDatabaseId(databaseId, queryOption)
	if err != nil {
		return err
	}
	result := make([]serializers.IndexSyncStatusListResponseItem, len(syncs))
	for i, sync := range syncs {
		result[i] = serializers.IndexSyncStatusListResponseItem{
			Id:          sync.Id,
			Status:      sync.Status,
			Progress:    sync.Progress,
			Error:       sync.Error,
			IsFinished:  sync.IsFinished,
			StartedAt:   sync.StartedAt,
			CompletedAt: sync.CompletedAt,
			CreatedAt:   sync.CreatedAt,
		}
	}
	return response.NewArrayWithPagination(ctx, result, &request.Pagination{})
}

func (ctrl *controller) SyncFromDatabase(ctx *fiber.Ctx) error {
	var requestBody serializers.IndexSyncFromDatabaseValidate
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
	dbClient, err := mongodb.New(database.Uri)
	if err != nil {
		logger.Error().Err(err).Str("function", "SyncFromDatabase").Str("functionInline", "mongodb.New").Msg("index-controller")
		return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Cannot connect to database"})
	}
	clientIndexes, err := dbClient.GetIndexesByDbName(database.DBName)
	if err != nil {
		logger.Error().Err(err).Str("function", "SyncFromDatabase").Str("functionInline", "dbClient.GetIndexesByDbName").Msg("index-controller")
		return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Cannot get indexes from database"})
	}
	indexQuery := queries.NewIndex(ctx.Context())
	queryOption.SetOnlyFields("_id", "key_signature", "collection", "name")
	existingIndexes, err := indexQuery.GetByDatabaseId(requestBody.DatabaseId, queryOption)
	if err != nil {
		return err
	}
	existingIndexMap := make(map[string]struct{})
	for _, idx := range existingIndexes {
		key := idx.Collection + ":" + idx.KeySignature
		existingIndexMap[key] = struct{}{}
		if idx.Name != "" {
			keyByName := idx.Collection + ":" + idx.Name
			existingIndexMap[keyByName] = struct{}{}
		}
	}
	importedCount := 0
	skippedCount := 0
	for _, clientIndex := range clientIndexes {
		keys := make([]models.IndexKey, len(clientIndex.Keys))
		for i, key := range clientIndex.Keys {
			keys[i] = models.IndexKey{
				Field: key.Field,
				Value: key.Value,
			}
		}
		var collation *models.Collation
		if clientIndex.Options.Collation != nil {
			collation = &models.Collation{
				Locale:          clientIndex.Options.Collation.Locale,
				Strength:        clientIndex.Options.Collation.Strength,
				CaseLevel:       clientIndex.Options.Collation.CaseLevel,
				CaseFirst:       clientIndex.Options.Collation.CaseFirst,
				NumericOrdering: clientIndex.Options.Collation.NumericOrdering,
			}
		}
		indexModel := models.Index{
			Options: models.IndexOption{
				ExpireAfterSeconds: clientIndex.Options.ExpireAfterSeconds,
				IsUnique:           clientIndex.Options.IsUnique,
				Collation:          collation,
				DefaultLanguage:    clientIndex.Options.DefaultLanguage,
				Weights:            clientIndex.Options.Weights,
			},
			Collection: clientIndex.Collection,
			Name:       clientIndex.Name,
			Keys:       keys,
			DatabaseId: requestBody.DatabaseId,
		}
		indexModel.IsText = clientIndex.IsText
		if indexModel.IsText && indexModel.Options.DefaultLanguage == "" {
			indexModel.Options.DefaultLanguage = "none"
		}
		indexModel.KeySignature = indexModel.GetKeySignature()
		if indexModel.Name == "" {
			indexModel.Name = indexModel.KeySignature
		}
		keyBySignature := indexModel.Collection + ":" + indexModel.KeySignature
		keyByName := indexModel.Collection + ":" + indexModel.Name
		if _, exists := existingIndexMap[keyBySignature]; exists {
			skippedCount++
			continue
		}
		if _, exists := existingIndexMap[keyByName]; exists {
			skippedCount++
			continue
		}
		if _, err := indexQuery.CreateOne(indexModel); err != nil {
			logger.Error().Err(err).Str("function", "SyncFromDatabase").Str("functionInline", "indexQuery.CreateOne").Str("collection", clientIndex.Collection).Str("name", indexModel.Name).Msg("index-controller")
			continue
		}
		importedCount++
		existingIndexMap[keyBySignature] = struct{}{}
		if indexModel.Name != "" {
			existingIndexMap[keyByName] = struct{}{}
		}
	}
	return response.New(ctx, response.Options{Data: serializers.IndexSyncFromDatabaseResponse{
		ImportedCount: importedCount,
		SkippedCount:  skippedCount,
	}})
}

func (ctrl *controller) SyncByDatabase(ctx *fiber.Ctx) error {
	var requestBody serializers.IndexSyncByDatabaseValidate
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
	syncQuery := queries.NewSync(ctx.Context())
	queryOption.SetOnlyFields("_id")
	if _, err = syncQuery.GetByDatabaseIdAndIsFinished(requestBody.DatabaseId, false, queryOption); err != nil {
		if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
			return err
		}
	} else {
		return response.New(ctx, response.Options{Code: fiber.StatusConflict, Data: respErr.ErrResourceConflict})
	}
	indexQuery := queries.NewIndex(ctx.Context())
	queryOption.SetOnlyFields("options", "keys", "key_signature", "collection", "name")
	indexes, err := indexQuery.GetByDatabaseId(requestBody.DatabaseId, queryOption)
	if err != nil {
		return err
	}
	collections := make([]string, 0)
	mapCollection := make(map[string]struct{})
	mapIndexManager := make(map[string]map[string]models.Index)
	for _, index := range indexes {
		if _, exists := mapCollection[index.Collection]; !exists {
			collections = append(collections, index.Collection)
			mapCollection[index.Collection] = struct{}{}
		}
		if _, exists := mapIndexManager[index.Collection]; !exists {
			mapIndexManager[index.Collection] = make(map[string]models.Index)
		}
		mapIndexManager[index.Collection][index.KeySignature] = index
	}
	if len(collections) == 0 {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: "No collections with indexes found"})
	}
	dbClient, err := mongodb.New(database.Uri)
	if err != nil {
		logger.Error().Err(err).Str("function", "SyncByDatabase").Str("functionInline", "mongodb.New").Msg("index-controller")
		return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Can't connect to database"})
	}
	clientIndexes, err := dbClient.GetIndexesByDbNameAndCollections(database.DBName, collections)
	if err != nil {
		logger.Error().Err(err).Str("function", "SyncByDatabase").Str("functionInline", "dbClient.GetIndexesByDbNameAndCollections").Msg("index-controller")
		return response.New(ctx, response.Options{Code: fiber.StatusPreconditionFailed, Data: "Can't get indexes from database"})
	}
	sync, err := syncQuery.CreateOne(models.Sync{
		Error:       "",
		Collections: collections,
		DatabaseID:  requestBody.DatabaseId,
		IsFinished:  false,
		Status:      constants.SyncStatusPending,
		Progress:    0,
		StartedAt:   time.Now(),
	})
	if err != nil {
		return err
	}
	payloadData, _ := sonic.Marshal(job.PayloadSyncIndexByCollections{
		Collections:   collections,
		ClientIndexes: clientIndexes,
		ServerIndexes: indexes,
		Uri:           database.Uri,
		DBName:        database.DBName,
		SyncId:        sync.Id,
	})
	taskQueue := taskqueue.GetGlobal()
	if _, err = taskQueue.EnqueueTask(taskQueue.NewTask(taskqueue.TaskTypeSyncIndexByCollection, payloadData)); err != nil {
		logger.Error().Err(err).Str("function", "SyncByDatabase").Str("functionInline", "jobQueue.EnqueueTask").Msg("index-controller")
		_ = syncQuery.UpdateStatusById(sync.Id, constants.SyncStatusFailed, 0, "Failed to enqueue job")
		return response.NewError(fiber.StatusInternalServerError)
	}
	return response.New(ctx, response.Options{Data: fiber.Map{"success": true}})
}
