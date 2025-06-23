package routers

import (
	"github.com/gofiber/fiber/v2"

	authCtrl "doctor-manager-api/api/controllers/auth"
	authMiddleware "doctor-manager-api/api/middlewares/authenticate"
)

type Auth interface {
	V1()
}

type auth struct {
	router     fiber.Router
	controller authCtrl.Controller
}

func NewAuth(router fiber.Router) Auth {
	return &auth{
		router:     router.Group("/auth"),
		controller: authCtrl.New(),
	}
}

func (r *auth) V1() {
	r.router.Post("/register", r.controller.Register)
	r.router.Post("/login", r.controller.Login)
	r.router.Post("/refresh-token", authMiddleware.RefreshToken, r.controller.RefreshToken)
	r.router.Use(authMiddleware.AccessToken)
	r.router.Get("/profile", r.controller.GetProfile)
	r.router.Put("/profile", r.controller.UpdateProfile)
}
