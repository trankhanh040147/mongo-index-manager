package mongodb

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"doctor-manager-api/common/logging"
)

const defaultContextTimeout = 20 * time.Second

var logger = logging.GetLogger()

type Service interface {
	TestConnection(uri string) error
	GetIndexesByDbNameAndCollections(dbName string, collections []string) (indexes []Index, err error)
}

type service struct {
	client *mongo.Client
}

type Index struct {
	CreatedAt    time.Time   `bson:"created_at"`
	UpdatedAt    time.Time   `bson:"updated_at"`
	Options      IndexOption `bson:"options"`
	Collection   string      `bson:"collection"`
	Name         string      `bson:"name"`
	KeySignature string      `bson:"key_signature"`
	Keys         []IndexKey  `bson:"keys"`
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

func New(uri string) (Service, error) {
	opts := options.Client()
	opts.ApplyURI(uri)
	ctx, cancel := context.WithTimeout(context.Background(), defaultContextTimeout)
	defer cancel()
	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		logger.Error().Err(err).Str("function", "New").Str("functionInline", "mongo.Connect").Msg("mongodb")
		return nil, err
	}
	ctxPing, cancelPing := context.WithTimeout(context.Background(), defaultContextTimeout)
	defer cancelPing()
	if err = client.Ping(ctxPing, nil); err != nil {
		logger.Error().Err(err).Str("function", "New").Str("functionInline", "client.Ping").Msg("mongodb")
		return nil, err
	}
	return &service{
		client: client,
	}, nil
}
