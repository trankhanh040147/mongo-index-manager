package serializers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"doctor-manager-api/common/request/validator"
	"doctor-manager-api/common/response"
)

type IndexCreateBodyValidate struct {
	Collection string             `json:"collection" validate:"required"`
	Name       string             `json:"name" validate:"omitempty,max=100,ne=_id_"`
	Options    IndexCreateOption  `json:"options" validate:"required"`
	Keys       []IndexCreateKey   `json:"keys" validate:"required,min=1,unique=Field,dive"`
	DatabaseId primitive.ObjectID `json:"database_id" validate:"required"`
}

type IndexCreateOption struct {
	ExpireAfterSeconds *int32 `json:"expire_after_seconds" validate:"omitempty,gte=0"`
	IsUnique           bool   `json:"is_unique" validate:"omitempty"`
}

type IndexCreateKey struct {
	Field string `json:"field" validate:"required,ne=_id"`
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

type IndexGetResponse struct {
	CreatedAt    time.Time              `json:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at"`
	Options      IndexGetResponseOption `json:"options"`
	Collection   string                 `json:"collection"`
	Name         string                 `json:"name"`
	KeySignature string                 `json:"key_signature"`
	Keys         []IndexGetResponseKey  `json:"keys"`
	Id           primitive.ObjectID     `json:"id"`
	DatabaseId   primitive.ObjectID     `json:"database_id"`
}

type IndexGetResponseOption struct {
	ExpireAfterSeconds *int32 `json:"expire_after_seconds"`
	IsUnique           bool   `json:"is_unique"`
}

type IndexGetResponseKey struct {
	Field string `json:"field"`
	Value int32  `json:"value"`
}

type IndexListByCollectionBodyValidate struct {
	Query      string             `json:"query" validate:"omitempty"`
	Collection string             `json:"collection" validate:"required"`
	Page       int64              `json:"page" validate:"omitempty,min=0"`
	Limit      int64              `json:"limit" validate:"omitempty,min=0"`
	DatabaseId primitive.ObjectID `json:"database_id" validate:"required"`
}

func (v *IndexListByCollectionBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}

type IndexListByCollectionResponseItem struct {
	CreatedAt    time.Time                           `json:"created_at"`
	UpdatedAt    time.Time                           `json:"updated_at"`
	Options      IndexListByCollectionResponseOption `json:"options"`
	Collection   string                              `json:"collection"`
	Name         string                              `json:"name"`
	KeySignature string                              `json:"key_signature"`
	Keys         []IndexListByCollectionResponseKey  `json:"keys"`
	Id           primitive.ObjectID                  `json:"id"`
	DatabaseId   primitive.ObjectID                  `json:"database_id"`
}

type IndexListByCollectionResponseOption struct {
	ExpireAfterSeconds *int32 `json:"expire_after_seconds"`
	IsUnique           bool   `json:"is_unique"`
}

type IndexListByCollectionResponseKey struct {
	Field string `json:"field"`
	Value int32  `json:"value"`
}

type IndexUpdateBodyValidate struct {
	Name    string            `json:"name" validate:"omitempty,max=100,ne=_id_"`
	Options IndexUpdateOption `json:"options" validate:"required"`
	Keys    []IndexUpdateKey  `json:"keys" validate:"required,min=1,unique=Field,dive"`
}

type IndexUpdateOption struct {
	ExpireAfterSeconds *int32 `json:"expire_after_seconds" validate:"omitempty,gte=0"`
	IsUnique           bool   `json:"is_unique" validate:"omitempty"`
}

type IndexUpdateKey struct {
	Field string `json:"field" validate:"required,ne=_id"`
	Value int32  `json:"value" validate:"required,oneof=1 -1"`
}

func (v *IndexUpdateBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	if v.Options.ExpireAfterSeconds != nil && len(v.Keys) > 1 {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "ttl_compound"}})
	}
	return nil
}

type IndexCompareByCollectionsValidate struct {
	Collections []string           `json:"collections" validate:"required,min=1,unique"`
	DatabaseId  primitive.ObjectID `json:"database_id" validate:"required"`
}

func (v *IndexCompareByCollectionsValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}

type IndexCompareByCollectionsResponseItem struct {
	Collection       string                           `json:"collection"`
	MissingIndexes   []IndexCompareByCollectionsIndex `json:"missing_indexes"`
	MatchedIndexes   []IndexCompareByCollectionsIndex `json:"matched_indexes"`
	RedundantIndexes []IndexCompareByCollectionsIndex `json:"redundant_indexes"`
}

type IndexCompareByCollectionsIndex struct {
	Options IndexCompareByCollectionsIndexOption `json:"options,omitempty"`
	Name    string                               `json:"name"`
	Keys    []IndexCompareByCollectionsIndexKey  `json:"keys"`
}

type IndexCompareByCollectionsIndexOption struct {
	ExpireAfterSeconds *int32 `json:"expire_after_seconds"`
	IsUnique           bool   `json:"is_unique"`
}

type IndexCompareByCollectionsIndexKey struct {
	Field string `json:"field"`
	Value int32  `json:"value"`
}

type IndexCompareByDatabaseValidate struct {
	DatabaseId primitive.ObjectID `json:"database_id" validate:"required"`
}

func (v *IndexCompareByDatabaseValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}

type IndexCompareByDatabaseResponseItem struct {
	Collection       string                        `json:"collection"`
	MissingIndexes   []IndexCompareByDatabaseIndex `json:"missing_indexes"`
	MatchedIndexes   []IndexCompareByDatabaseIndex `json:"matched_indexes"`
	RedundantIndexes []IndexCompareByDatabaseIndex `json:"redundant_indexes"`
}

type IndexCompareByDatabaseIndex struct {
	Options IndexCompareByDatabaseIndexOption `json:"options,omitempty"`
	Name    string                            `json:"name"`
	Keys    []IndexCompareByDatabaseIndexKey  `json:"keys"`
}

type IndexCompareByDatabaseIndexOption struct {
	ExpireAfterSeconds *int32 `json:"expire_after_seconds"`
	IsUnique           bool   `json:"is_unique"`
}

type IndexCompareByDatabaseIndexKey struct {
	Field string `json:"field"`
	Value int32  `json:"value"`
}
