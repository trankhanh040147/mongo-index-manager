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

type CollationCreateOption struct {
	Strength        *int   `json:"strength,omitempty"`
	CaseLevel       *bool  `json:"case_level,omitempty"`
	NumericOrdering *bool  `json:"numeric_ordering,omitempty"`
	Locale          string `json:"locale" validate:"required"`
	CaseFirst       string `json:"case_first,omitempty"`
}

type IndexCreateOption struct {
	ExpireAfterSeconds *int32                 `json:"expire_after_seconds" validate:"omitempty,gte=0"`
	Collation          *CollationCreateOption `json:"collation,omitempty"`
	Weights            map[string]interface{} `json:"weights,omitempty"`
	DefaultLanguage    string                 `json:"default_language,omitempty" validate:"omitempty,mongodbLanguage"`
	IsUnique           bool                   `json:"is_unique" validate:"omitempty"`
}

type IndexCreateKey struct {
	Value interface{} `json:"value" validate:"required"`
	Field string      `json:"field" validate:"required,ne=_id"`
}

func (v *IndexCreateBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	if v.Options.ExpireAfterSeconds != nil && len(v.Keys) > 1 {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "ttl_compound"}})
	}
	hasTextIndex := false
	for _, key := range v.Keys {
		switch val := key.Value.(type) {
		case float64:
			if val != 1 && val != -1 {
				return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "value must be 1, -1, or \"text\""}})
			}
		case int32:
			if val != 1 && val != -1 {
				return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "value must be 1, -1, or \"text\""}})
			}
		case int:
			if val != 1 && val != -1 {
				return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "value must be 1, -1, or \"text\""}})
			}
		case string:
			if val == "text" {
				hasTextIndex = true
			} else {
				return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "value must be 1, -1, or \"text\""}})
			}
		default:
			return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "value must be 1, -1, or \"text\""}})
		}
	}
	if hasTextIndex && v.Options.Collation != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"options": "text indexes cannot have collation"}})
	}
	if v.Options.Collation != nil && v.Options.Collation.Locale == "" {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"options.collation": "locale is required"}})
	}
	if hasTextIndex && v.Options.Weights != nil && len(v.Options.Weights) > 0 {
		textFields := make(map[string]bool)
		for _, key := range v.Keys {
			if val, ok := key.Value.(string); ok && val == "text" {
				textFields[key.Field] = true
			}
		}
		for field := range textFields {
			if _, exists := v.Options.Weights[field]; !exists {
				return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"options.weights": "all text fields must be present in weights"}})
			}
		}
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

type CollationGetResponse struct {
	Strength        *int   `json:"strength,omitempty"`
	CaseLevel       *bool  `json:"case_level,omitempty"`
	NumericOrdering *bool  `json:"numeric_ordering,omitempty"`
	Locale          string `json:"locale"`
	CaseFirst       string `json:"case_first,omitempty"`
}

type IndexGetResponseOption struct {
	ExpireAfterSeconds *int32                 `json:"expire_after_seconds"`
	Collation          *CollationGetResponse  `json:"collation,omitempty"`
	Weights            map[string]interface{} `json:"weights,omitempty"`
	DefaultLanguage    string                 `json:"default_language,omitempty"`
	IsUnique           bool                   `json:"is_unique"`
}

type IndexGetResponseKey struct {
	Value interface{} `json:"value"`
	Field string      `json:"field"`
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
	IsDefault    bool                                `json:"is_default"`
}

type IndexListByCollectionResponseOption struct {
	ExpireAfterSeconds *int32                 `json:"expire_after_seconds"`
	Collation          *CollationGetResponse  `json:"collation,omitempty"`
	Weights            map[string]interface{} `json:"weights,omitempty"`
	DefaultLanguage    string                 `json:"default_language,omitempty"`
	IsUnique           bool                   `json:"is_unique"`
}

type IndexListByCollectionResponseKey struct {
	Value interface{} `json:"value"`
	Field string      `json:"field"`
}

type IndexUpdateBodyValidate struct {
	Name    string            `json:"name" validate:"omitempty,max=100,ne=_id_"`
	Options IndexUpdateOption `json:"options" validate:"required"`
	Keys    []IndexUpdateKey  `json:"keys" validate:"required,min=1,unique=Field,dive"`
}

type IndexUpdateOption struct {
	ExpireAfterSeconds *int32                 `json:"expire_after_seconds" validate:"omitempty,gte=0"`
	Collation          *CollationCreateOption `json:"collation,omitempty"`
	Weights            map[string]interface{} `json:"weights,omitempty"`
	DefaultLanguage    string                 `json:"default_language,omitempty" validate:"omitempty,mongodbLanguage"`
	IsUnique           bool                   `json:"is_unique" validate:"omitempty"`
}

type IndexUpdateKey struct {
	Value interface{} `json:"value" validate:"required"`
	Field string      `json:"field" validate:"required,ne=_id"`
}

func (v *IndexUpdateBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	if v.Options.ExpireAfterSeconds != nil && len(v.Keys) > 1 {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "ttl_compound"}})
	}
	hasTextIndex := false
	for _, key := range v.Keys {
		switch val := key.Value.(type) {
		case float64:
			if val != 1 && val != -1 {
				return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "value must be 1, -1, or \"text\""}})
			}
		case int32:
			if val != 1 && val != -1 {
				return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "value must be 1, -1, or \"text\""}})
			}
		case int:
			if val != 1 && val != -1 {
				return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "value must be 1, -1, or \"text\""}})
			}
		case string:
			if val == "text" {
				hasTextIndex = true
			} else {
				return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "value must be 1, -1, or \"text\""}})
			}
		default:
			return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"keys": "value must be 1, -1, or \"text\""}})
		}
	}
	if hasTextIndex && v.Options.Collation != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"options": "text indexes cannot have collation"}})
	}
	if v.Options.Collation != nil && v.Options.Collation.Locale == "" {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"options.collation": "locale is required"}})
	}
	if hasTextIndex && v.Options.Weights != nil && len(v.Options.Weights) > 0 {
		textFields := make(map[string]bool)
		for _, key := range v.Keys {
			if val, ok := key.Value.(string); ok && val == "text" {
				textFields[key.Field] = true
			}
		}
		for field := range textFields {
			if _, exists := v.Options.Weights[field]; !exists {
				return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: fiber.Map{"options.weights": "all text fields must be present in weights"}})
			}
		}
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
	Options      IndexCompareByCollectionsIndexOption `json:"options,omitempty"`
	Name         string                               `json:"name"`
	Keys         []IndexCompareByCollectionsIndexKey  `json:"keys"`
	KeySignature string                               `json:"key_signature"`
}

type IndexCompareByCollectionsIndexOption struct {
	ExpireAfterSeconds *int32                 `json:"expire_after_seconds"`
	Collation          *CollationGetResponse  `json:"collation,omitempty"`
	Weights            map[string]interface{} `json:"weights,omitempty"`
	DefaultLanguage    string                 `json:"default_language,omitempty"`
	IsUnique           bool                   `json:"is_unique"`
}

type IndexCompareByCollectionsIndexKey struct {
	Value interface{} `json:"value"`
	Field string      `json:"field"`
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
	Options      IndexCompareByDatabaseIndexOption `json:"options,omitempty"`
	Name         string                            `json:"name"`
	Keys         []IndexCompareByDatabaseIndexKey  `json:"keys"`
	KeySignature string                            `json:"key_signature"`
}

type IndexCompareByDatabaseIndexOption struct {
	ExpireAfterSeconds *int32                 `json:"expire_after_seconds"`
	Collation          *CollationGetResponse  `json:"collation,omitempty"`
	Weights            map[string]interface{} `json:"weights,omitempty"`
	DefaultLanguage    string                 `json:"default_language,omitempty"`
	IsUnique           bool                   `json:"is_unique"`
}

type IndexCompareByDatabaseIndexKey struct {
	Value interface{} `json:"value"`
	Field string      `json:"field"`
}

type IndexSyncByCollectionsValidate struct {
	Collections []string           `json:"collections" validate:"required,min=1,unique"`
	DatabaseId  primitive.ObjectID `json:"database_id" validate:"required"`
}

func (v *IndexSyncByCollectionsValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}

type IndexSyncStatusResponse struct {
	StartedAt   time.Time          `json:"started_at"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
	CompletedAt *time.Time         `json:"completed_at,omitempty"`
	Status      string             `json:"status"`
	Error       string             `json:"error"`
	Collections []string           `json:"collections"`
	Progress    int                `json:"progress"`
	Id          primitive.ObjectID `json:"id"`
	DatabaseId  primitive.ObjectID `json:"database_id"`
	IsFinished  bool               `json:"is_finished"`
}

type IndexSyncStatusListResponseItem struct {
	StartedAt   time.Time          `json:"started_at"`
	CreatedAt   time.Time          `json:"created_at"`
	CompletedAt *time.Time         `json:"completed_at,omitempty"`
	Status      string             `json:"status"`
	Error       string             `json:"error"`
	Progress    int                `json:"progress"`
	Id          primitive.ObjectID `json:"id"`
	IsFinished  bool               `json:"is_finished"`
}

type IndexSyncFromDatabaseValidate struct {
	DatabaseId primitive.ObjectID `json:"database_id" validate:"required"`
}

func (v *IndexSyncFromDatabaseValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}

type IndexSyncFromDatabaseResponse struct {
	ImportedCount int `json:"imported_count"`
	SkippedCount  int `json:"skipped_count"`
}

type IndexSyncByDatabaseValidate struct {
	DatabaseId primitive.ObjectID `json:"database_id" validate:"required"`
}

func (v *IndexSyncByDatabaseValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}
