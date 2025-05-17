package index

import (
	"errors"

	"github.com/gofiber/fiber/v2"

	"doctor-manager-api/api/serializers"
	"doctor-manager-api/common/logging"
	"doctor-manager-api/common/response"
	respErr "doctor-manager-api/common/response/error"
	"doctor-manager-api/database/mongo/models"
	"doctor-manager-api/database/mongo/queries"
)

var logger = logging.GetLogger()

type Controller interface {
	Create(ctx *fiber.Ctx) error
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
