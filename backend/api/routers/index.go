package routers

import (
	"github.com/gofiber/fiber/v2"

	indexCtrl "doctor-manager-api/api/controllers/index"
	authMiddleware "doctor-manager-api/api/middlewares/authenticate"
)

type Index interface {
	V1()
}

type index struct {
	router     fiber.Router
	controller indexCtrl.Controller
}

func NewIndex(router fiber.Router) Index {
	return &index{
		router:     router.Group("/indexes"),
		controller: indexCtrl.New(),
	}
}

func (r *index) V1() {
	r.router.Use(authMiddleware.AccessToken)
	r.router.Post("/", r.controller.Create)
	r.router.Get("/:id", r.controller.Get)
	r.router.Post("/list-by-collection", r.controller.ListByCollection)
	r.router.Put("/:id", r.controller.Update)
	r.router.Delete("/:id", r.controller.Delete)
	r.router.Post("/compare-by-collections", r.controller.CompareByCollections)
	r.router.Post("/compare-by-database", r.controller.CompareByDatabase)
}
