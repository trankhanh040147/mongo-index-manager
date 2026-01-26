package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Sync struct {
	CreatedAt   time.Time          `bson:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at"`
	StartedAt   time.Time          `bson:"started_at"`
	CompletedAt *time.Time         `bson:"completed_at,omitempty"`
	Error       string             `bson:"error"`
	Status      string             `bson:"status"`
	Collections []string           `bson:"collections"`
	Progress    int                `bson:"progress"`
	Id          primitive.ObjectID `bson:"_id,omitempty"`
	DatabaseID  primitive.ObjectID `bson:"database_id"`
	IsFinished  bool               `bson:"is_finished"`
}

func (m *Sync) CollectionName() string {
	return "syncs"
}
