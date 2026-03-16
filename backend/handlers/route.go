package handlers

import (
	"net/http"

	"ngovietthanh27/tracking-map/models"
	"ngovietthanh27/tracking-map/services"

	"github.com/gin-gonic/gin"
)

// RouteHandler handles route-related HTTP requests
type RouteHandler struct {
	routeService *services.RouteService
}

// NewRouteHandler creates a new RouteHandler instance
func NewRouteHandler(routeService *services.RouteService) *RouteHandler {
	return &RouteHandler{
		routeService: routeService,
	}
}

// GetRoute handles the route calculation request
func (h *RouteHandler) GetRoute(c *gin.Context) {
	var req models.RouteRequest

	// Parse request body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Yêu cầu không hợp lệ: " + err.Error(),
		})
		return
	}

	// Get route from service
	route, err := h.routeService.CalculateRoute(req.From, req.To)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, route)
}
