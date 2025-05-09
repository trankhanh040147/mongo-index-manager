package local

import (
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"doctor-manager-api/database/mongo/models"
)

type Service interface {
	SetUser(user models.Account)
	GetUser() models.Account
	SetExtraBody(value []byte)
	GetExtraBody() string
	GetStatusCode() int
	SetStatusCode(value int)
	SetTokenId(value primitive.ObjectID)
	GetTokenId() primitive.ObjectID
}

const (
	KeyTokenId    = "tokenId"
	KeyUser       = "user"
	KeyExtraBody  = "extraBody"
	KeyStatusCode = "statusCode"
)

type service struct {
	context *fiber.Ctx
}

func New(ctx *fiber.Ctx) Service {
	return &service{context: ctx}
}
