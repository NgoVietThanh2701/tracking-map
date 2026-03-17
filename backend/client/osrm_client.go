package client

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"sync"
	"time"

	"ngovietthanh27/tracking-map/config"
	"ngovietthanh27/tracking-map/models"

	"github.com/redis/go-redis/v9"
)

var (
	redisOnce   sync.Once
	redisClient *redis.Client
)

func getRedisClient() *redis.Client {
	redisOnce.Do(func() {
		addr := os.Getenv("REDIS_ADDR")
		if addr == "" {
			// If not configured, caching stays disabled.
			return
		}

		redisClient = redis.NewClient(&redis.Options{
			Addr:     addr,
			Password: os.Getenv("REDIS_PASSWORD"),
		})
	})

	return redisClient
}

func GetRoute(from, to models.RoutePoint) (*models.RouteResponse, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf(
		"osrm:route:%s:%s:%s:%.6f,%.6f:%.6f,%.6f:overview=simplified:geometries=geojson:steps=false",
		config.OSRMVersion,
		config.OSRMProfile,
		"v1",
		from.Lat, from.Lng,
		to.Lat, to.Lng,
	)

	// CACHE: Try to serve route from Redis (TTL 60s)
	if rdb := getRedisClient(); rdb != nil {
		if cached, err := rdb.Get(ctx, cacheKey).Bytes(); err == nil && len(cached) > 0 {
			var route models.RouteResponse
			if err := json.Unmarshal(cached, &route); err == nil {
				return &route, nil
			}
		}
	}

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

	routeResp := &models.RouteResponse{
		Distance: route.Distance,
		Duration: route.Duration,
		LatLngs:  latLngs,
	}

	// CACHE: Store computed route to Redis for 60 seconds
	if rdb := getRedisClient(); rdb != nil {
		if b, err := json.Marshal(routeResp); err == nil {
			_ = rdb.Set(ctx, cacheKey, b, 60*time.Second).Err()
		}
	}

	return routeResp, nil
}
