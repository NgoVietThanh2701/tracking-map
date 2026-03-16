package services

import (
	"fmt"

	"ngovietthanh27/tracking-map/models"
	"ngovietthanh27/tracking-map/utils"
)

// RouteService handles route-related business logic
type RouteService struct{}

// NewRouteService creates a new RouteService instance
func NewRouteService() *RouteService {
	return &RouteService{}
}

// CalculateRoute calculates the route between two points
func (s *RouteService) CalculateRoute(from, to models.RoutePoint) (*models.RouteResponse, error) {
	// Validate points
	if err := validateRoutePoints(from, to); err != nil {
		return nil, err
	}

	// Get route from OSRM
	return utils.GetRoute(from, to)
}

// validateRoutePoints validates that two points are different
func validateRoutePoints(from, to models.RoutePoint) error {
	if from.Lat == to.Lat && from.Lng == to.Lng {
		return fmt.Errorf("điểm A và B phải khác nhau")
	}
	return nil
}
