package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"doctor-manager-api/common/configure"
	"doctor-manager-api/common/logging"

	"go.elastic.co/apm/module/apmmongo/v2"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	managerDBClient *mongo.Client
	logger          = logging.GetLogger()
	cfg             = configure.GetConfig()
	utils           = NewUtilityService()
)

func InitDatabase() {
	managerDBClient = initClientConnection(cfg.MongoDBManagerUri, cfg.ElasticAPMEnable)
	autoIndexing()
}

func autoIndexing() {
	if cfg.MongoAutoIndexing {
		managerDBAccountIndex()
		managerDBAuthTokenIndex()
	}
}

func DisconnectDatabase() {
	_ = managerDBClient.Disconnect(context.Background())
}

// GetDatabase returns the MongoDB database instance
func GetDatabase() *mongo.Database {
	return managerDBClient.Database(cfg.MongoDBManagerName)
}

func initClientConnection(mongoURI string, enableAPM bool) *mongo.Client {
	opts := options.Client()
	opts.ApplyURI(mongoURI)
	if enableAPM {
		opts.SetMonitor(apmmongo.CommandMonitor())
	}
	ctx, cancel := utils.GetContextTimeout(context.Background())
	defer cancel()
	client, err := mongo.Connect(ctx, opts)
	if err != nil {
		logger.Fatal().Err(err).Str("function", "initClientConnection").Str("functionInline", "mongo.Connect").Msg("database")
	}
	ctxPing, cancelPing := utils.GetContextTimeout(context.Background())
	defer cancelPing()
	if err = client.Ping(ctxPing, nil); err != nil {
		logger.Fatal().Err(err).Str("function", "initClientConnection").Str("functionInline", "client.Ping").Msg("database")
	}
	return client
}

func managerDBAccountIndex() {
	collIndex := utils.GetAccountCollection().Indexes()
	ctxDrop, cancelDrop := utils.GetContextTimeout(context.Background())
	defer cancelDrop()
	_, _ = collIndex.DropAll(ctxDrop)
	ctx, cancel := utils.GetContextTimeout(context.Background())
	defer cancel()
	if _, err := collIndex.CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "username", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	}); err != nil {
		logger.Fatal().Err(err).Msg("managerDBAccountIndex")
	}
}

func managerDBAuthTokenIndex() {
	collIndex := utils.GetAuthTokenCollection().Indexes()
	ctxDrop, cancelDrop := utils.GetContextTimeout(context.Background())
	defer cancelDrop()
	_, _ = collIndex.DropAll(ctxDrop)
	ctx, cancel := utils.GetContextTimeout(context.Background())
	defer cancel()
	if _, err := collIndex.CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "expired_at", Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(0),
		},
	}); err != nil {
		logger.Fatal().Err(err).Msg("managerDBAuthTokenIndex")
	}
}
