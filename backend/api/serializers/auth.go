package serializers

import (
	"github.com/gofiber/fiber/v2"

	"doctor-manager-api/common/request/validator"
	"doctor-manager-api/common/response"
)

type AuthRegisterBodyValidate struct {
	Username string `json:"username" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,gte=8"`
}

func (v *AuthRegisterBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}

type AuthLoginBodyValidate struct {
	Identity string `json:"identity" validate:"required"`
	Password string `json:"password" validate:"required"`
}

func (v *AuthLoginBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}

type AuthLoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type AuthRefreshTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type AuthGetProfileResponse struct {
	Username  string `json:"username"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Avatar    string `json:"avatar"`
}

type AuthUpdateProfileBodyValidate struct {
	FirstName string `json:"first_name,omitempty"`
	LastName  string `json:"last_name,omitempty"`
	Avatar    string `json:"avatar,omitempty"`
}

func (v *AuthUpdateProfileBodyValidate) Validate() error {
	validateEngine := validator.GetValidateEngine()
	if err := validateEngine.Struct(v); err != nil {
		return response.NewError(fiber.StatusBadRequest, response.ErrorOptions{Data: validator.ParseValidateError(err)})
	}
	return nil
}
