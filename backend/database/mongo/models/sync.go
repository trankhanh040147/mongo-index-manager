package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Sync struct {
	CreatedAt   time.Time          `bson:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at"`
	Error       string             `bson:"error"`
	Collections []string           `bson:"collections"`
	Id          primitive.ObjectID `bson:"id,omitempty"`
	DatabaseID  primitive.ObjectID `bson:"database_id"`
	IsFinished  bool               `bson:"is_finished"`
}

func (m *Sync) CollectionName() string {
	return "syncs"
}
