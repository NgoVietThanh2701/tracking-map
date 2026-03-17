package client

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"ngovietthanh27/tracking-map/config"
	"ngovietthanh27/tracking-map/models"
)

func GetRoute(from, to models.RoutePoint) (*models.RouteResponse, error) {
	// Build OSRM URL
	coords := fmt.Sprintf("%f,%f;%f,%f", from.Lng, from.Lat, to.Lng, to.Lat)
	osrmURL := fmt.Sprintf(
		"%s/%s/%s/%s/%s",
		config.OSRMBaseURL, "route", config.OSRMVersion, config.OSRMProfile, coords,
	)

	u, err := url.Parse(osrmURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse URL: %w", err)
	}

	q := u.Query()
	q.Set("overview", "simplified")
	q.Set("geometries", "geojson")
	q.Set("steps", "false")
	u.RawQuery = q.Encode()

	resp, err := http.Get(u.String())
	if err != nil {
		return nil, fmt.Errorf("failed to get route from OSRM: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("OSRM returned status %d: %s", resp.StatusCode, string(body))
	}

	var osrmResp models.OSRMResponse
	if err := json.NewDecoder(resp.Body).Decode(&osrmResp); err != nil {
		return nil, fmt.Errorf("failed to parse OSRM response: %w", err)
	}

	if len(osrmResp.Routes) == 0 {
		return nil, fmt.Errorf("không tìm thấy tuyến đường phù hợp")
	}

	route := osrmResp.Routes[0]
	coords2 := route.Geometry.Coordinates

	if len(coords2) < 2 {
		return nil, fmt.Errorf("không tìm thấy tuyến đường phù hợp")
	}

	// Convert [lng, lat] to [lat, lng]
	latLngs := make([][]float64, len(coords2))
	for i, coord := range coords2 {
		if len(coord) >= 2 {
			latLngs[i] = []float64{coord[1], coord[0]}
		}
	}

	return &models.RouteResponse{
		Distance: route.Distance,
		Duration: route.Duration,
		LatLngs:  latLngs,
	}, nil
}
