package controllers

import (
	"net/http"

	"ngovietthanh27/tracking-map/models"
	"ngovietthanh27/tracking-map/services"

	"github.com/gin-gonic/gin"
)

type RouteController struct {
	routeService *services.RouteService
}

func NewRouteController(routeService *services.RouteService) *RouteController {
	return &RouteController{routeService: routeService}
}

func (c *RouteController) GetRoute(ctx *gin.Context) {
	var req models.RouteRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	route, err := c.routeService.CalculateRoute(req.From, req.To)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, route)
}
