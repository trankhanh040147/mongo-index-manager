package mongo

import (
	"context"

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
	}
}

func DisconnectDatabase() {
	_ = managerDBClient.Disconnect(context.Background())
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
