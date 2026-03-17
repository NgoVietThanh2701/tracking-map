package models

type RouteRequest struct {
	From RoutePoint `json:"from" binding:"required"`
	To   RoutePoint `json:"to" binding:"required"`
}

type RoutePoint struct {
	Lat float64 `json:"lat" binding:"required"`
	Lng float64 `json:"lng" binding:"required"`
}

type RouteResponse struct {
	Distance float64     `json:"distance"`
	Duration float64     `json:"duration"`
	LatLngs  [][]float64 `json:"latlngs"`
}

type OSRMResponse struct {
	Routes []OSRMRoute `json:"routes"`
}

type OSRMRoute struct {
	Distance float64      `json:"distance"`
	Duration float64      `json:"duration"`
	Geometry OSRMGeometry `json:"geometry"`
}

type OSRMGeometry struct {
	Type        string      `json:"type"`
	Coordinates [][]float64 `json:"coordinates"`
}
