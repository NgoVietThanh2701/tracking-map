package models

// RouteRequest represents the request payload for route calculation
type RouteRequest struct {
	From RoutePoint `json:"from" binding:"required"`
	To   RoutePoint `json:"to" binding:"required"`
}

// RoutePoint represents a geographic point
type RoutePoint struct {
	Lat float64 `json:"lat" binding:"required"`
	Lng float64 `json:"lng" binding:"required"`
}

// RouteResponse represents the API response with route information
type RouteResponse struct {
	Distance float64     `json:"distance"` // meters
	Duration float64     `json:"duration"` // seconds
	LatLngs  [][]float64 `json:"latlngs"`  // [lat, lng] format
}

// OSRMResponse represents the response structure from OSRM API
type OSRMResponse struct {
	Routes []OSRMRoute `json:"routes"`
}

// OSRMRoute represents a route from OSRM
type OSRMRoute struct {
	Distance float64      `json:"distance"`
	Duration float64      `json:"duration"`
	Geometry OSRMGeometry `json:"geometry"`
}

// OSRMGeometry represents the geometry data from OSRM
type OSRMGeometry struct {
	Type        string      `json:"type"`
	Coordinates [][]float64 `json:"coordinates"` // [lng, lat] in GeoJSON format
}
