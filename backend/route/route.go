package route

import (
	"ngovietthanh27/tracking-map/controllers"
	"ngovietthanh27/tracking-map/repository"
	"ngovietthanh27/tracking-map/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB) {
	routeService := services.NewRouteService()
	routeController := controllers.NewRouteController(routeService)

	deviceRepo := repository.NewDeviceRepository(db)
	deviceService := services.NewDeviceService(deviceRepo)
	deviceController := controllers.NewDeviceController(deviceService)

	api := router.Group("/api/v1")
	RouteAPIs(api, routeController)

	DeviceAPIs(api, deviceController)
}
