package serializers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"doctor-manager-api/common/request/validator"
	"doctor-manager-api/common/response"
)

type DatabaseGetResponse struct {
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
	Name        string             `json:"name"`
	Description string             `json:"description"`
	Uri         string             `json:"uri"`
	DBName      string             `json:"db_name"`
	Id          primitive.ObjectID `json:"id"`
}

type DatabaseCreateBodyValidate struct {
	Name             string `json:"name" validate:"required"`
	Description      string `json:"description" validate:"omitempty"`
	Uri              string `json:"uri" validate:"required,databaseUri"`
	DBName           string `json:"db_name" validate:"required"`
	IsTestConnection bool   `json:"is_test_connection" validate:"omitempty"`
	IsSyncIndex      bool   `json:"is_sync_index" validate:"omitempty"`
}

func (v *DatabaseCreateBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}

type DatabaseListBodyValidate struct {
	Query string `json:"query" validate:"omitempty,max=500"`
	Page  int64  `json:"page" validate:"omitempty,min=0"`
	Limit int64  `json:"limit" validate:"omitempty,min=0"`
}

func (v *DatabaseListBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}

type DatabaseListResponseItem struct {
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
	Name        string             `json:"name"`
	Description string             `json:"description"`
	Uri         string             `json:"uri"`
	DBName      string             `json:"db_name"`
	Id          primitive.ObjectID `json:"id"`
}

type DatabaseUpdateBodyValidate struct {
	Name             string `json:"name" validate:"required"`
	Description      string `json:"description" validate:"omitempty"`
	Uri              string `json:"uri" validate:"required,databaseUri"`
	DBName           string `json:"db_name" validate:"required"`
	IsTestConnection bool   `json:"is_test_connection" validate:"omitempty"`
}

func (v *DatabaseUpdateBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}

type DatabaseListCollectionsBodyValidate struct {
	Query      string             `json:"query" validate:"omitempty"`
	Page       int64              `json:"page" validate:"omitempty,min=0"`
	Limit      int64              `json:"limit" validate:"omitempty,min=0"`
	DatabaseId primitive.ObjectID `json:"database_id" validate:"required"`
}

func (v *DatabaseListCollectionsBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}

type DatabaseListCollectionsResponseItem struct {
	Collection   string `json:"collection"`
	TotalIndexes int    `json:"total_indexes"`
}

type DatabaseCreateCollectionBodyValidate struct {
	Collection string             `json:"collection" validate:"required"`
	DatabaseId primitive.ObjectID `json:"database_id" validate:"required"`
}

func (v *DatabaseCreateCollectionBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}
