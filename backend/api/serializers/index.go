package serializers

import (
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"doctor-manager-api/common/request/validator"
	"doctor-manager-api/common/response"
)

type IndexGetResponse struct {
}

type IndexCreateBodyValidate struct {
	Collection string             `json:"collection" validate:"required"`
	Name       string             `json:"name" validate:"omitempty,max=100"`
	Options    IndexCreateOption  `json:"options" validate:"required"`
	Keys       []IndexCreateKey   `json:"keys" validate:"required,min=1,unique=Field,dive"`
	DatabaseId primitive.ObjectID `json:"database_id" validate:"required"`
}

type IndexCreateOption struct {
	ExpireAfterSeconds *int32 `json:"expire_after_seconds" validate:"omitempty,gte=0"`
	IsUnique           bool   `json:"is_unique" validate:"omitempty"`
}

type IndexCreateKey struct {
	Field string `json:"field" validate:"required"`
	Value int32  `json:"value" validate:"required,oneof=1 -1"`
}

func (v *IndexCreateBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	if v.Options.ExpireAfterSeconds != nil && len(v.Keys) > 1 {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "ttl_compound"}})
	}
	return nil
}
