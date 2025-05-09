package authenticate

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"doctor-manager-api/common/configure"
	"doctor-manager-api/common/response"
	respErr "doctor-manager-api/common/response/error"
	"doctor-manager-api/database/mongo/queries"
	jwtTool "doctor-manager-api/utilities/jwt"
	"doctor-manager-api/utilities/local"
)

var cfg = configure.GetConfig()

func RefreshToken(ctx *fiber.Ctx) error {
	tokenString := ctx.Get("Authorization")
	if tokenString == "" {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: respErr.ErrTokenRequired})
	}
	if !strings.HasPrefix(tokenString, cfg.TokenType) {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: respErr.ErrTokenWrongFormat})
	}
	tokenString = strings.TrimSpace(strings.TrimPrefix(tokenString, cfg.TokenType))
	payload, err := jwtTool.GetGlobal().ValidateToken(tokenString)
	if err != nil {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: respErr.ErrTokenWrong})
	}
	if !payload.IsRefreshToken() {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: respErr.ErrTokenWrong})
	}
	tokenId, err := primitive.ObjectIDFromHex(payload.ID)
	if err != nil {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: respErr.ErrTokenWrong})
	}
	queryOption := queries.NewOptions()
	queryOption.SetOnlyFields("_id", "user_id")
	token, err := queries.NewAuthToken(ctx.Context()).GetById(tokenId, queryOption)
	if err != nil {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: respErr.ErrTokenRevoked})
	}
	queryOption.SetOnlyFields("_id")
	user, err := queries.NewAccount(ctx.Context()).GetById(token.AccountId, queryOption)
	if err != nil {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: "User not found"})
	}
	localService := local.New(ctx)
	localService.SetUser(*user)
	localService.SetTokenId(tokenId)
	return ctx.Next()
}

func AccessToken(ctx *fiber.Ctx) error {
	tokenString := ctx.Get("Authorization")
	if tokenString == "" {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: respErr.ErrTokenRequired})
	}
	if !strings.HasPrefix(tokenString, cfg.TokenType) {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: respErr.ErrTokenWrongFormat})
	}
	token := strings.TrimSpace(strings.TrimPrefix(tokenString, cfg.TokenType))
	payload, err := jwtTool.GetGlobal().ValidateToken(token)
	if err != nil {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: respErr.ErrTokenWrong})
	}
	if !payload.IsAccessToken() {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: respErr.ErrTokenWrong})
	}
	tokenId, err := primitive.ObjectIDFromHex(payload.ID)
	if err != nil {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: respErr.ErrTokenWrong})
	}
	opt := queries.NewOptions()
	opt.SetOnlyFields("_id", "user_id")
	tok, err := queries.NewAuthToken(ctx.Context()).GetById(tokenId, opt)
	if err != nil {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: respErr.ErrTokenRevoked})
	}
	opt.SetOnlyFields("_id", "username", "alias", "avatar_url", "oauth_access_token")
	user, err := queries.NewAccount(ctx.Context()).GetById(tok.AccountId, opt)
	if err != nil {
		return response.NewError(fiber.StatusUnauthorized, response.ErrorOptions{Data: "User not found"})
	}
	local.New(ctx).SetUser(*user)
	return ctx.Next()
}
