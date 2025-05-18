package models

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Index struct {
	CreatedAt    time.Time          `bson:"created_at"`
	UpdatedAt    time.Time          `bson:"updated_at"`
	Options      IndexOption        `bson:"options"`
	Collection   string             `bson:"collection"`
	Name         string             `bson:"name"`
	KeySignature string             `bson:"key_signature"`
	Keys         []IndexKey         `bson:"keys"`
	DatabaseId   primitive.ObjectID `bson:"database_id"`
	Id           primitive.ObjectID `bson:"_id,omitempty"`
}

type IndexOption struct {
	ExpireAfterSeconds *int32 `bson:"expire_after_seconds"`
	IsUnique           bool   `bson:"is_unique"`
}

type IndexKey struct {
	Field string `bson:"field"`
	Value int32  `bson:"value"`
}

func (m *Index) GetKeySignature() string {
	if len(m.Keys) == 0 {
		return ""
	}
	var keyString string
	for _, key := range m.Keys {
		keyString += fmt.Sprintf("%s_%d_", key.Field, key.Value)
	}
	if m.Options.IsUnique {
		keyString += "unique_"
	}
	if m.Options.ExpireAfterSeconds != nil {
		keyString += fmt.Sprintf("expireAfterSeconds_%d", *m.Options.ExpireAfterSeconds)
	}
	return keyString
}

func (m *Index) CollectionName() string {
	return "indexes"
}
