package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/mongo"

	"doctor-manager-api/database/mongo/models"
)

type UtilityService interface {
	GetContextTimeout(ctx context.Context) (context.Context, context.CancelFunc)
	GetBulkWriteContextTimeout(ctx context.Context) (context.Context, context.CancelFunc)
	GetAccountCollection() (coll *mongo.Collection)
	GetAuthTokenCollection() (coll *mongo.Collection)
	GetDatabaseCollection() (coll *mongo.Collection)
	GetIndexCollection() (coll *mongo.Collection)
}

type utilityService struct{}

func NewUtilityService() UtilityService {
	service := utilityService{}
	return &service
}

func (s *utilityService) GetContextTimeout(ctx context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(ctx, cfg.MongoDBRequestTimeout)
}

func (s *utilityService) GetBulkWriteContextTimeout(ctx context.Context) (context.Context, context.CancelFunc) {
	return context.WithTimeout(ctx, cfg.MongoDBBulkWriteRequestTimeout)
}

func (s *utilityService) getManagerDb() (db *mongo.Database) {
	return managerDBClient.Database(cfg.MongoDBManagerName)
}

func (s *utilityService) GetAccountCollection() (coll *mongo.Collection) {
	return s.getManagerDb().Collection(new(models.Account).CollectionName())
}

func (s *utilityService) GetAuthTokenCollection() (coll *mongo.Collection) {
	return s.getManagerDb().Collection(new(models.AuthToken).CollectionName())
}

func (s *utilityService) GetDatabaseCollection() (coll *mongo.Collection) {
	return s.getManagerDb().Collection(new(models.Database).CollectionName())
}

func (s *utilityService) GetIndexCollection() (coll *mongo.Collection) {
	return s.getManagerDb().Collection(new(models.Index).CollectionName())
}
