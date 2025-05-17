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
	r.router.Use(authMiddleware.AccessToken)
	r.router.Get("/:id", r.controller.Get)
	r.router.Post("/", r.controller.Create)
	r.router.Post("/list", r.controller.List)
	r.router.Put("/:id/", r.controller.Update)
}
