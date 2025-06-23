package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Account struct {
	CreatedAt    time.Time          `bson:"created_at"`
	UpdatedAt    time.Time          `bson:"updated_at"`
	Username     string             `bson:"username"`
	FirstName    string             `bson:"first_name"`
	LastName     string             `bson:"last_name"`
	Avatar       string             `bson:"avatar"`
	Email        string             `bson:"email"`
	PasswordHash string             `bson:"password_hash"`
	Id           primitive.ObjectID `bson:"_id,omitempty"`
}

func (m *Account) CollectionName() string {
	return "accounts"
}
