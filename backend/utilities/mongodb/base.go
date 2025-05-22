package mongodb

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"doctor-manager-api/common/logging"
)

const defaultContextTimeout = 10 * time.Second

var logger = logging.GetLogger()

type Service interface {
	TestConnection(uri string) error
	GetIndexesByDbNameAndCollections(dbName string, collections []string) (indexes []mongo.IndexModel, err error)
}

type service struct {
	client *mongo.Client
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
