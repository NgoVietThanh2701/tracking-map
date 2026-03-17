package route

import (
	"ngovietthanh27/tracking-map/controllers"

	"github.com/gin-gonic/gin"
)

// RouteAPIs contains route-related endpoints
func RouteAPIs(api *gin.RouterGroup, routeController *controllers.RouteController) {
	routes := api.Group("/route")
	{
		routes.POST("", routeController.GetRoute)
	}
}
