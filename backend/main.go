package main

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	recoverFiber "github.com/gofiber/fiber/v2/middleware/recover"

	_ "go.uber.org/automaxprocs"

	"doctor-manager-api/api/routers"
	"doctor-manager-api/common/configure"
	"doctor-manager-api/common/logging"
	"doctor-manager-api/common/request/validator"
	"doctor-manager-api/common/response"
	respErr "doctor-manager-api/common/response/error"
	"doctor-manager-api/database/mongo"
	"doctor-manager-api/job"
	"doctor-manager-api/utilities/jwt"
	taskqueue "doctor-manager-api/utilities/taskqueue"
)

var cfg = configure.GetConfig()

func main() {
	logging.InitLogger()
	validator.InitValidateEngine()
	mongo.InitDatabase()
	app := fiber.New(fiber.Config{
		ErrorHandler: response.FiberErrorHandler,
		JSONDecoder:  sonic.Unmarshal,
		JSONEncoder:  sonic.Marshal,
	})
	jwt.New(cfg.TokenPrivateKey, cfg.TokenPublicKey).InitGlobal()
	initJobQueue()
	addMiddleware(app)
	addV1Route(app)
	handleURLNotFound(app)
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	go func() {
		logging.GetLogger().Info().Msg("ready")
		if err := app.Listen(cfg.ServerAddress()); err != nil {
			logging.GetLogger().Error().Err(err).Str("function", "main").Str("functionInline", "app.Listen").Msg("Can't start server")
		}
		sigChan <- syscall.SIGTERM
	}()
	<-sigChan
	logging.GetLogger().Info().Msg("Shutting down...")
	_ = app.Shutdown()
	taskqueue.GetGlobal().Stop()
	mongo.DisconnectDatabase()
}

func handleURLNotFound(app *fiber.App) {
	app.Use(func(ctx *fiber.Ctx) error {
		return response.New(ctx, response.Options{Code: fiber.StatusNotFound, Data: respErr.ErrUrlNotFound})
	})
}

func addMiddleware(app *fiber.App) {
	if cfg.ElasticAPMEnable {
		app.Use(logging.FiberApmMiddleware())
	} else {
		recoverConfig := recoverFiber.ConfigDefault
		recoverConfig.EnableStackTrace = cfg.Debug
		app.Use(recoverFiber.New(recoverConfig))
	}
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: true,
	}))
	app.Use(logging.FiberLoggerMiddleware())
}

func addV1Route(app *fiber.App) {
	route := app.Group("/api/doctor-manager-api/v1")
	routers.NewAuth(route).V1()
	routers.NewDatabase(route).V1()
	routers.NewIndex(route).V1()
}

func initJobQueue() {
	db := mongo.GetDatabase()
	serv, err := taskqueue.New(db, taskqueue.Option{
		Concurrency: cfg.JobConcurrency,
	})
	if err != nil {
		logging.GetLogger().Fatal().Err(err).Str("function", "initJobQueue").Str("functionInline", "taskqueue.New").Msg("main")
	}
	serv.InitGlobal()
	job.SetupHandler(serv)
	go serv.Start()
}
