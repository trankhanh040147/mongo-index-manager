package validator

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"

	"doctor-manager-api/common/logging"
)

var (
	validateEngine *validator.Validate
	logger         = logging.GetLogger()
)

type ValidateFunction struct {
	Function validator.Func
	Tag      string
}

func InitValidateEngine() *validator.Validate {
	validateEngine = validator.New()
	const numSubstring = 2
	validateEngine.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", numSubstring)[0]
		if name == "" {
			name = strings.SplitN(fld.Tag.Get("query"), ",", numSubstring)[0]
		}
		if name == "" {
			name = strings.SplitN(fld.Tag.Get("form"), ",", numSubstring)[0]
		}
		if name == "-" {
			return ""
		}
		return name
	})
	RegisterValidate(databaseUri)
	return validateEngine
}

func GetValidateEngine() *validator.Validate {
	return validateEngine
}

func RegisterValidate(functions ...ValidateFunction) {
	for _, function := range functions {
		if err := validateEngine.RegisterValidation(function.Tag, function.Function); err != nil {
			logger.Fatal().Err(err).Msg("register tag validate error")
		}
	}
}

func ParseValidateError(rawErr error) fiber.Map {
	result := fiber.Map{}
	for _, err := range rawErr.(validator.ValidationErrors) {
		errValue := err.ActualTag()
		if err.Param() != "" {
			errValue = fmt.Sprintf("%s=%s", errValue, err.Param())
		}
		result[err.Field()] = errValue
	}
	return result
}
