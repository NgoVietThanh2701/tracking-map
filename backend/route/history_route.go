package route

import (
	"ngovietthanh27/tracking-map/controllers"

	"github.com/gin-gonic/gin"
)

// HistoryAPIs contains history-related endpoints
func HistoryAPIs(api *gin.RouterGroup, historyController *controllers.HistoryController) {
	histories := api.Group("/histories")
	{
		histories.POST("", historyController.CreateBatchHistory)
		histories.GET("", historyController.GetHistory)
	}
}
