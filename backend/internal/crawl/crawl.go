package crawler

import (
	"fmt"
	"io"
	"math/rand"
	"net/http"
	tile "ngovietthanh27/tracking-map/internal/tile"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type Bounds struct {
	MinLat float64
	MaxLat float64
	MinLng float64
	MaxLng float64
}

const (
	userAgent = "tile-demo/1.0 (nvthanh.19it6@sict.udn.vn)"

	// Base delay giữa các request để giảm nguy cơ bị rate-limit.
	baseDelay = 200 * time.Millisecond

	maxRetries = 5
	timeout    = 30 * time.Second
)

var (
	httpClient = &http.Client{Timeout: timeout}
	rng        = rand.New(rand.NewSource(time.Now().UnixNano()))
)

func CrawlDaNang(zoom int) {
	CrawlDaNangZoomRange(zoom, zoom)
}

func CrawlDaNangZoomRange(minZoom, maxZoom int) {
	if minZoom > maxZoom {
		minZoom, maxZoom = maxZoom, minZoom
	}

	bounds := Bounds{
		MinLat: 15.9,
		MaxLat: 16.2,
		MinLng: 108.0,
		MaxLng: 108.4,
	}

	for z := minZoom; z <= maxZoom; z++ {
		crawlBoundsAtZoom(bounds, z)
	}
}

func crawlBoundsAtZoom(bounds Bounds, zoom int) {
	minX, maxY := tile.LatLngToTile(bounds.MinLat, bounds.MinLng, zoom)
	maxX, minY := tile.LatLngToTile(bounds.MaxLat, bounds.MaxLng, zoom)

	if minX > maxX {
		minX, maxX = maxX, minX
	}
	if minY > maxY {
		minY, maxY = maxY, minY
	}

	for x := minX; x <= maxX; x++ {
		for y := minY; y <= maxY; y++ {
			if err := downloadTile(x, y, zoom); err != nil {
				fmt.Println("Download error:", zoom, x, y, err)
			}
		}
	}
}

func downloadTile(x, y, z int) error {
	dir := filepath.Join("tiles", fmt.Sprintf("%d/%d", z, x))
	filePath := filepath.Join(dir, fmt.Sprintf("%d.png", y))

	// Resume: nếu tile đã tồn tại và có kích thước > 0 thì bỏ qua.
	if st, err := os.Stat(filePath); err == nil && st.Size() > 0 {
		return nil
	}

	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return err
	}

	// openstreetmap cung cấp tile ở dạng subdomain a/b/c để phân tải.
	sub := []string{"a", "b", "c"}[(x+y)%3]
	url := fmt.Sprintf("https://%s.tile.openstreetmap.org/%d/%d/%d.png", sub, z, x, y)

	delay := baseDelay
	for attempt := 1; attempt <= maxRetries; attempt++ {
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return err
		}

		// User-Agent (có email thật) là bắt buộc theo tile usage policy.
		req.Header.Set("User-Agent", userAgent)
		req.Header.Set("Accept", "image/png,image/*,*/*;q=0.8")

		resp, err := httpClient.Do(req)
		if err != nil {
			if attempt == maxRetries {
				return err
			}
			sleepWithJitter(delay)
			delay = time.Duration(float64(delay) * 1.6)
			continue
		}

		if resp.StatusCode == http.StatusOK {
			// Ghi ra file tạm rồi rename để tránh tạo file lỗi (0 bytes).
			tmpPath := filePath + ".part"
			f, err := os.Create(tmpPath)
			if err != nil {
				_ = resp.Body.Close()
				return err
			}

			_, copyErr := io.Copy(f, resp.Body)
			closeErr := f.Close()
			_ = resp.Body.Close()

			if copyErr != nil || closeErr != nil {
				_ = os.Remove(tmpPath)
				if attempt == maxRetries {
					if copyErr != nil {
						return copyErr
					}
					return closeErr
				}
				sleepWithJitter(delay)
				delay = time.Duration(float64(delay) * 1.6)
				continue
			}

			if err := os.Rename(tmpPath, filePath); err != nil {
				_ = os.Remove(tmpPath)
				return err
			}

			sleepWithJitter(delay)
			return nil
		}

		retryAfter := parseRetryAfter(resp.Header.Get("Retry-After"))
		_ = resp.Body.Close()

		// 404: tile tồn tại nhưng không có dữ liệu -> không retry.
		if resp.StatusCode == http.StatusNotFound {
			return nil
		}

		// 429/5xx: retry có backoff.
		if resp.StatusCode == http.StatusTooManyRequests || resp.StatusCode >= 500 {
			if retryAfter > 0 {
				time.Sleep(retryAfter)
			} else {
				sleepWithJitter(delay)
			}
			delay = time.Duration(float64(delay) * 1.8)
			continue
		}

		// Các status khác (vd 403): không retry vô hạn.
		fmt.Println("Download failed:", z, x, y, "status:", resp.StatusCode, "url:", url)
		return nil
	}

	return fmt.Errorf("download failed after %d retries", maxRetries)
}

func sleepWithJitter(d time.Duration) {
	// Thêm jitter nhỏ để tránh "đều đặn" theo nhịp request.
	jitter := time.Duration(rng.Intn(120)) * time.Millisecond
	time.Sleep(d + jitter)
}

func parseRetryAfter(v string) time.Duration {
	v = strings.TrimSpace(v)
	if v == "" {
		return 0
	}

	// Retry-After thường là số giây.
	if secs, err := strconv.Atoi(v); err == nil && secs > 0 {
		return time.Duration(secs) * time.Second
	}

	// Nếu server gửi http-date thì bỏ qua (để đơn giản).
	return 0
}
