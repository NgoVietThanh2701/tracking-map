package services

import (
	"fmt"

	"ngovietthanh27/tracking-map/client"
	"ngovietthanh27/tracking-map/models"
)

type RouteService struct{}

func NewRouteService() *RouteService {
	return &RouteService{}
}

func (s *RouteService) CalculateRoute(from, to models.RoutePoint) (*models.RouteResponse, error) {
	if from.Lat == to.Lat && from.Lng == to.Lng {
		return nil, fmt.Errorf("điểm A và B phải khác nhau")
	}
	return client.GetRoute(from, to)
}
