package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Database struct {
	CreatedAt   time.Time          `bson:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
	Uri         string             `bson:"uri"`
	DBName      string             `bson:"db_name"`
	Id          primitive.ObjectID `bson:"_id,omitempty"`
}

func (m *Database) CollectionName() string {
	return "databases"
}
