package route

import (
	"ngovietthanh27/tracking-map/controllers"
	crawler "ngovietthanh27/tracking-map/internal/crawl"
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

	historyRepo := repository.NewHistoryRepository(db)
	historyService := services.NewHistoryService(historyRepo)
	historyController := controllers.NewHistoryController(historyService)

	api := router.Group("/api/v1")
	RouteAPIs(api, routeController)
	DeviceAPIs(api, deviceController)
	HistoryAPIs(api, historyController)

	// Crawl API
	api.POST("/crawl", func(c *gin.Context) {
		go crawler.CrawlDaNangZoomRange(12, 17)
		c.JSON(200, gin.H{"status": "crawling started..."})
	})
}
