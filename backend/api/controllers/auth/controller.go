package auth

import (
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"

	"doctor-manager-api/api/serializers"
	"doctor-manager-api/common/configure"
	"doctor-manager-api/common/logging"
	"doctor-manager-api/common/response"
	respErr "doctor-manager-api/common/response/error"
	"doctor-manager-api/database/mongo/models"
	"doctor-manager-api/database/mongo/queries"
	"doctor-manager-api/utilities/jwt"
	"doctor-manager-api/utilities/local"
)

var (
	cfg    = configure.GetConfig()
	logger = logging.GetLogger()
)

type Controller interface {
	Register(ctx *fiber.Ctx) error
	Login(ctx *fiber.Ctx) error
	RefreshToken(ctx *fiber.Ctx) error
	GetProfile(ctx *fiber.Ctx) error
	UpdateProfile(ctx *fiber.Ctx) error
}

type controller struct {
}

func New() Controller {
	return &controller{}
}

func (c *controller) Register(ctx *fiber.Ctx) error {
	var requestBody serializers.AuthRegisterBodyValidate
	if err := ctx.BodyParser(&requestBody); err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: respErr.ErrFieldWrongType})
	}
	if err := requestBody.Validate(); err != nil {
		return err
	}
	queryOption := queries.NewOptions()
	queryOption.SetOnlyFields("_id")
	accountQuery := queries.NewAccount(ctx.Context())
	if _, err := accountQuery.GetByUsernameOrEmail(requestBody.Username, requestBody.Email, queryOption); err != nil {
		if e := new(response.Error); errors.As(err, &e) && e.Code != fiber.StatusNotFound {
			return err
		}
	} else {
		return response.NewError(fiber.StatusConflict, response.ErrorOptions{Data: respErr.ErrResourceConflict})
	}
	password, err := bcrypt.GenerateFromPassword([]byte(requestBody.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.Error().Err(err).Str("functionInline", "bcrypt.GenerateFromPassword").Str("function", "Register")
		return response.NewError(fiber.StatusInternalServerError)
	}
	if _, err = accountQuery.CreateOne(models.Account{
		Username:     requestBody.Username,
		Email:        requestBody.Email,
		PasswordHash: string(password),
	}); err != nil {
		return err
	}
	return response.New(ctx, response.Options{
		Code: fiber.StatusCreated,
		Data: fiber.Map{
			"success": true,
		},
	})
}

func (c *controller) Login(ctx *fiber.Ctx) error {
	var requestBody serializers.AuthLoginBodyValidate
	if err := ctx.BodyParser(&requestBody); err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: respErr.ErrFieldWrongType})
	}
	if err := requestBody.Validate(); err != nil {
		return err
	}
	queryOption := queries.NewOptions()
	queryOption.SetOnlyFields("password_hash", "_id")
	account, err := queries.NewAccount(ctx.Context()).GetByUsernameOrEmail(requestBody.Identity, requestBody.Identity, queryOption)
	if err != nil {
		return err
	}
	if err = bcrypt.CompareHashAndPassword([]byte(account.PasswordHash), []byte(requestBody.Password)); err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: "Invalid password"})
	}
	token, err := queries.NewAuthToken(ctx.Context()).CreateOne(models.AuthToken{
		ExpiredAt: time.Now().Add(cfg.RefreshTokenTimeout),
		AccountId: account.Id,
	})
	if err != nil {
		return err
	}
	accessToken, refreshToken, err := jwt.GetGlobal().GeneratePairToken(token.Id.Hex(), cfg.AccessTokenTimeout, cfg.RefreshTokenTimeout)
	if err != nil {
		logger.Error().Err(err).Str("functionInline", "jwt.GetGlobal().GeneratePairToken").Str("function", "Login").Msg("auth-controller")
		return response.New(ctx, response.Options{Code: fiber.StatusInternalServerError})
	}
	return response.New(ctx, response.Options{
		Data: serializers.AuthLoginResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		},
	})
}

func (c *controller) RefreshToken(ctx *fiber.Ctx) error {
	localService := local.New(ctx)
	tokenQuery := queries.NewAuthToken(ctx.Context())
	if err := tokenQuery.DeleteById(localService.GetTokenId()); err != nil {
		return err
	}
	token, err := tokenQuery.CreateOne(models.AuthToken{
		ExpiredAt: time.Now().Add(cfg.RefreshTokenTimeout),
		AccountId: localService.GetUser().Id,
	})
	if err != nil {
		return err
	}
	accessToken, refreshToken, err := jwt.GetGlobal().GeneratePairToken(token.Id.Hex(), cfg.AccessTokenTimeout, cfg.RefreshTokenTimeout)
	if err != nil {
		logger.Error().Err(err).Str("function", "RefreshToken").Str("functionInline", "jwt.GetGlobal().GeneratePairToken").Msg("auth-controller")
		return response.New(ctx, response.Options{Code: fiber.StatusInternalServerError})
	}
	return response.New(ctx, response.Options{
		Data: serializers.AuthRefreshTokenResponse{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		},
	})
}

func (c *controller) GetProfile(ctx *fiber.Ctx) error {
	account := local.New(ctx).GetUser()
	return response.New(ctx, response.Options{
		Data: serializers.AuthGetProfileResponse{
			Username:  account.Username,
			Email:     account.Email,
			FirstName: account.FirstName,
			LastName:  account.LastName,
			Avatar:    account.Avatar,
		},
	})
}

func (c *controller) UpdateProfile(ctx *fiber.Ctx) error {
	var requestBody serializers.AuthUpdateProfileBodyValidate
	if err := ctx.BodyParser(&requestBody); err != nil {
		return response.New(ctx, response.Options{Code: fiber.StatusBadRequest, Data: respErr.ErrFieldWrongType})
	}
	if err := requestBody.Validate(); err != nil {
		return err
	}
	if err := queries.NewAccount(ctx.Context()).UpdateProfileById(local.New(ctx).GetUser().Id, queries.AccountUpdateProfileByIdRequest{
		FirstName: requestBody.FirstName,
		LastName:  requestBody.LastName,
		Avatar:    requestBody.Avatar,
	}); err != nil {
		return err
	}
	return response.New(ctx, response.Options{Data: fiber.Map{
		"success": true,
	}})
}
