package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthToken struct {
	ExpiredAt time.Time          `bson:"expired_at"`
	CreatedAt time.Time          `bson:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at"`
	AccountId primitive.ObjectID `bson:"account_id"`
	Id        primitive.ObjectID `bson:"_id,omitempty"`
}

func (m *AuthToken) CollectionName() string {
	return "auth_tokens"
}
