package configure

import (
	"fmt"
	"time"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"

	"github.com/rs/zerolog/log"
)

var config *Configuration

type Configuration struct {
	TokenPublicKey                 string        `env:"TOKEN_PUBLIC_KEY_PATH,file" envDefault:"certs/public.pem" envExpand:"true"`
	TokenPrivateKey                string        `env:"TOKEN_PRIVATE_KEY_PATH,file" envDefault:"certs/private.pem" envExpand:"true"`
	Port                           string        `env:"PORT" envDefault:"8216"`
	Host                           string        `env:"HOST" envDefault:"0.0.0.0"`
	TokenType                      string        `env:"TOKEN_TYPE" envDefault:"Bearer"`
	MongoDBManagerUri              string        `env:"MONGODB_MANAGER_URI" envDefault:"mongodb://localhost:27017"`
	MongoDBManagerName             string        `env:"MONGODB_MANAGER_NAME" envDefault:"db_manager"`
	RedisAddress                   string        `env:"REDIS_ADDRESS" envDefault:"127.0.0.1:6379"`
	PaginationMaxItem              int64         `env:"PAGINATION_MAX_ITEM" envDefault:"50"`
	RedisPoolSize                  int           `env:"REDIS_POOL_SIZE" envDefault:"10"`
	JobConcurrency                 int           `env:"JOB_CONCURRENCY" envDefault:"10"`
	MongoDBRequestTimeout          time.Duration `env:"MONGODB_REQUEST_TIMEOUT" envDefault:"3m"`
	MongoDBBulkWriteRequestTimeout time.Duration `env:"MONGODB_BULK_WRITE_REQUEST_TIMEOUT" envDefault:"10m"`
	AccessTokenTimeout             time.Duration `env:"ACCESS_TOKEN_TIMEOUT" envDefault:"10m"`
	RefreshTokenTimeout            time.Duration `env:"REFRESH_TOKEN_TIMEOUT" envDefault:"24h"`
	RedisDialTimeout               time.Duration `env:"REDIS_DIAL_TIMEOUT" envDefault:"5s"`
	RedisReadTimeout               time.Duration `env:"REDIS_READ_TIMEOUT" envDefault:"3s"`
	RedisWriteTimeout              time.Duration `env:"REDIS_WRITE_TIMEOUT" envDefault:"3s"`
	Debug                          bool          `env:"DEBUG" envDefault:"false"`
	ElasticAPMEnable               bool          `env:"ELASTIC_APM_ENABLE" envDefault:"false"`
	MongoAutoIndexing              bool          `env:"MONGO_AUTO_INDEXING" envDefault:"false"`
}

func (cfg Configuration) ServerAddress() string {
	return fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)
}

func GetConfig() Configuration {
	if config == nil {
		_ = godotenv.Load()
		config = &Configuration{}
		if err := env.Parse(config); err != nil {
			log.Fatal().Err(err).Msg("Get Config Error")
		}
	}
	return *config
}
