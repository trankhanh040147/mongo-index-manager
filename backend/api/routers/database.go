package routers

import (
	"github.com/gofiber/fiber/v2"

	databaseCtrl "doctor-manager-api/api/controllers/database"
	authMiddleware "doctor-manager-api/api/middlewares/authenticate"
)

type Database interface {
	V1()
}

type database struct {
	router     fiber.Router
	controller databaseCtrl.Controller
}

func NewDatabase(router fiber.Router) Database {
	return &database{
		router:     router.Group("/databases"),
		controller: databaseCtrl.New(),
	}
}

func (r *database) V1() {
	r.collection()
	r.root()
}

func (r *database) root() {
	router := r.router.Group("/")
	router.Use(authMiddleware.AccessToken)
	router.Get("/:id", r.controller.Get)
	router.Post("/", r.controller.Create)
	router.Post("/list", r.controller.List)
	router.Put("/:id/", r.controller.Update)
}

func (r *database) collection() {
	router := r.router.Group("/collections")
	router.Use(authMiddleware.AccessToken)
	router.Post("/list", r.controller.ListCollections)
}
