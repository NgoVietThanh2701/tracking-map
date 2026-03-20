# Tracking Map

Ứng dụng mô phỏng thiết bị di chuyển trên bản đồ, tìm tuyến đường và xem lại lịch sử di chuyển theo khoảng thời gian.

## 1) Tính năng

- **Quản lý thiết bị**
  - Thêm thiết bị (tên + vị trí/địa chỉ)
  - Chọn thiết bị để hiển thị marker trên bản đồ
  - Xoá thiết bị
  - Cập nhật vị trí/địa chỉ thiết bị sau khi mô phỏng kết thúc

- **Tìm kiếm địa chỉ**
  - Autocomplete địa chỉ (Nominatim)
  - Hiển thị marker vị trí tìm kiếm trên bản đồ

- **Tìm tuyến đường**
  - Tìm tuyến đường từ A → B (OSRM)
  - Hiển thị polyline và nhãn khoảng cách
  - **Cache tuyến đường bằng Redis trong 60 giây** để giảm số lần gọi OSRM

- **Mô phỏng di chuyển**
  - Phát chuyển động theo tuyến đường với thời gian mô phỏng (giây)
  - Lưu lại các điểm di chuyển theo thời gian

- **Xem lịch sử di chuyển**
  - Tìm lịch sử theo thiết bị và khoảng thời gian
  - Vẽ lại route lịch sử + hiển thị số bản ghi, quãng đường, thời lượng
  - Phát lại lịch sử (playback) theo tốc độ tuỳ chọn

## 2) Công nghệ & thư viện

### Backend

- **Ngôn ngữ / Framework**
  - Go
  - Gin (`github.com/gin-gonic/gin`)
- **Database**
  - PostgreSQL
  - GORM (`gorm.io/gorm`, `gorm.io/driver/postgres`)
- **Cache**
  - Redis (`github.com/redis/go-redis/v9`) — cache OSRM route 60s
- **Khác**
  - CORS middleware (`github.com/gin-contrib/cors`)
  - Load biến môi trường `.env` (`github.com/joho/godotenv`)

### Frontend

- **React + build tool**
  - React, ReactDOM
  - Vite
- **UI**
  - TailwindCSS
- **Map**
  - Leaflet, React-Leaflet
- **HTTP**
  - Axios

## 3) Cách chạy dự án

### Yêu cầu

- Node.js (để chạy frontend)
- Go (để chạy backend)
- PostgreSQL (hoặc dùng Docker Compose)
- Redis (khuyến nghị để bật cache route; nếu không có Redis, backend vẫn chạy bình thường nhưng không cache)

### 3.1) Chạy database (PostgreSQL) bằng Docker Compose

Trong thư mục `backend/`:

```bash
docker compose up -d
```

Postgres sẽ mở port **5433** trên máy local theo `backend/docker-compose.yml`.

### 3.2) Cấu hình biến môi trường backend

Tạo/cập nhật file `backend/.env` (ví dụ hiện có):

- `DB_CONNECT_STR`: chuỗi kết nối Postgres
- `PORT`: port backend (mặc định 5000)
- `REDIS_ADDR`: địa chỉ Redis (để bật cache)
- `REDIS_PASSWORD`: mật khẩu Redis (nếu có)

Ví dụ:

```env
DB_CONNECT_STR="host=127.0.0.1 port=5433 user=postgres password=123456 dbname=tracking_map sslmode=disable"
PORT=5000
REDIS_ADDR=127.0.0.1:6379
REDIS_PASSWORD=123456
```

### 3.3) Chạy backend

Trong thư mục `backend/`:

```bash
go run .
```

Backend chạy tại `http://127.0.0.1:5000` (theo `PORT`).

### 3.4) Chạy frontend

Trong thư mục `frontend/`:

```bash
npm install
npm run dev
```

Frontend sẽ chạy trên dev server của Vite. Frontend gọi backend qua base URL:

- `http://127.0.0.1:5000/api/v1` (định nghĩa trong `frontend/src/api/axios.js`)

## 4) Kiến trúc hệ thống

### Backend architecture (Gin)

- **Entry point**
  - `backend/main.go`: init Gin, CORS, connect DB, setup routes
- **Routing**
  - `backend/route/`: định nghĩa nhóm API `/api/v1`
- **Controllers**
  - `backend/controllers/`: nhận request/validate, gọi service, trả JSON
- **Services**
  - `backend/services/`: business logic
  - `RouteService` gọi OSRM client để lấy route
  - `HistoryService` xử lý lưu/lấy lịch sử
  - `DeviceService` xử lý CRUD thiết bị
- **Repositories**
  - `backend/repository/`: thao tác DB qua GORM
- **Clients**
  - `backend/client/osrm_client.go`: gọi OSRM
    - **CACHE (Redis, 60s)**: GET/SET route theo key từ from/to + options
- **Models**
  - `backend/models/`: request/response structs + entity structs

#### Luồng chính (tóm tắt)

- **Route**
  - `POST /api/v1/routes` → `RouteController` → `RouteService` → `osrm_client.GetRoute()` → trả `RouteResponse`
  - `osrm_client.GetRoute()`:
    - (CACHE) thử lấy Redis trước
    - gọi OSRM nếu cache miss
    - (CACHE) lưu Redis 60s
- **History**
  - `POST /api/v1/histories`: lưu batch lịch sử (khi mô phỏng kết thúc)
  - `GET /api/v1/histories?device_id=...&start_time=...&end_time=...`: lấy lịch sử theo thời gian (RFC3339)
- **Devices**
  - CRUD thiết bị (tuỳ theo route hiện có)

### Frontend architecture (React + Vite)

- **API layer**
  - `frontend/src/api/`: axios instance + các hàm gọi endpoint (`device`, `route`, `history`)
- **Service layer**
  - `frontend/src/services/`: gom logic gọi API + transform dữ liệu (`deviceService`, `historyService`)
- **Hooks**
  - `frontend/src/hooks/`: stateful logic cho UI
    - `useDevices`: tải/chọn/xoá/cập nhật thiết bị
    - `useOsrmRoute`: lấy tuyến đường A→B
    - `useSimulation`: mô phỏng di chuyển theo thời gian
    - `useMovementHistory`: tải và dựng dữ liệu lịch sử để vẽ route
- **Components**
  - `frontend/src/components/`: UI + map layers (MapView, HistoryRoute, InfoPanel, ...)
- **Constants / Utils**
  - `frontend/src/constants/`: text constants, cấu hình map, icon builders
  - `frontend/src/utils/`: formatter, cleanup map layers, transforms

#### Luồng mô phỏng & lưu lịch sử (tóm tắt)

- User chọn thiết bị + điểm đến → lấy route OSRM → start simulation
- Trong lúc mô phỏng: gom các điểm (lat/lng + `time_stamp`)
- Khi mô phỏng kết thúc: gửi batch lên backend `POST /api/v1/histories`
- Tab “Lịch sử”: gọi `GET /api/v1/histories` theo `device_id` + thời gian → vẽ lại route và playback

#--------------------------------- Tile Crawler - Da Nang

Công cụ này dùng để **crawl bản đồ dạng tile** từ OpenStreetMap cho khu vực Đà Nẵng ở nhiều mức zoom khác nhau. Tiles được lưu lại cục bộ để dùng cho ứng dụng offline hoặc phân tích dữ liệu.

## Mục đích

- Lấy dữ liệu bản đồ dạng tile (ảnh PNG) cho khu vực Đà Nẵng.
- Giảm tải khi hiển thị bản đồ bằng cách lưu tile cục bộ.
- Tự động xử lý retry, backoff khi gặp lỗi mạng hoặc rate-limit.

## Flow hoạt động

1. **API gọi crawl**  
   Người dùng gửi POST request đến endpoint `/crawl` → kích hoạt `CrawlDaNangZoomRange(minZoom, maxZoom)` chạy trong goroutine.

2. **Xác định vùng cần crawl**
   - Dùng `Bounds` để xác định lat/lng min/max:
     ```
     MinLat: 15.9, MaxLat: 16.2
     MinLng: 108.0, MaxLng: 108.4
     ```

3. **Tính toán tile**
   - Mỗi điểm lat/lng được chuyển thành tile `(x, y)` tại zoom tương ứng bằng `LatLngToTile`.

4. **Download tile**
   - Kiểm tra tile đã tồn tại chưa, nếu có bỏ qua.
   - Gửi request đến `https://{a|b|c}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
   - Retry với exponential backoff nếu gặp lỗi 5xx hoặc rate-limit (429).
   - Lưu tile theo cấu trúc thư mục: `tiles/{zoom}/{x}/{y}.png`.

5. **Hoàn tất**
   - Tiles được lưu đầy đủ theo từng zoom, sẵn sàng dùng cho hiển thị hoặc phân tích offline.

## API sử dụng

```http
POST /crawl
```
