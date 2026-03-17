package route

import (
	"ngovietthanh27/tracking-map/controllers"

	"github.com/gin-gonic/gin"
)

// DeviceAPIs contains device-related endpoints
func DeviceAPIs(api *gin.RouterGroup, deviceController *controllers.DeviceController) {
	devices := api.Group("/devices")
	{
		devices.GET("", deviceController.GetAllDevices)
		devices.POST("", deviceController.CreateDevice)
		devices.DELETE("/:id", deviceController.DeleteDevice)
		devices.PATCH("/:id/address", deviceController.UpdateDeviceAddress)
	}
}
