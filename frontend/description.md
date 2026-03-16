# Tracking Map - Tài liệu Mô tả Chi tiết Từng File

## 📱 App.jsx (File chính)

**Vị trí:** `src/App.jsx`

**Chức năng:** Component chính của ứng dụng, đóng vai trò như "trung tâm điều khiển" (main controller) để quản lý toàn bộ state và logic của ứng dụng.

**Chi tiết:**

- Khởi tạo tất cả các hooks liên quan: `useDevices`, `useOsrmRoute`, `useSimulation`, `useMovementHistory`
- Quản lý các state chính:
  - `searchPlace`: Vị trí tìm kiếm được chọn
  - `routeFrom / routeTo`: Điểm xuất phát và đích của tuyến đường
  - `simDestination`: Điểm đích cho mô phỏng
  - `historyStartTime / historyEndTime`: Khoảng thời gian cho lịch sử di chuyển
  - `historyPlaybackDuration`: Thời gian phát lại lịch sử
- Quản lý logic liên kết giữa các tính năng:
  - Auto-center map khi chọn device
  - Tự động tìm route khi chọn device + destination
  - Xử lý khi mô phỏng hoàn thành (cập nhật vị trí device)
  - Quản lý chi tiết simulation playback
- Render các component chính: `MapView`, `InfoPanel`, `SimulationMarkers`

---

## 📍 Components Folder (Các thành phần UI)

### 1. **MapView.jsx**

**Vị trí:** `src/components/MapView.jsx`

**Chức năng:** Component bản đồ chính, tích hợp thư viện Leaflet để hiển thị bản đồ OpenStreetMap.

**Chi tiết:**

- Tạo container bản đồ interactif với Leaflet + React-Leaflet
- Quản lý các layer bản đồ con:
  - **SearchMarker**: Hiển thị marker tại vị trí tìm kiếm
  - **RouteLayer**: Hiển thị tuyến đường (route) và markers start/end
  - **DeviceMarker**: Hiển thị marker của từng thiết bị
  - **HistoryRoute**: Hiển thị lịch sử di chuyển
  - **SimulationMarkers**: Hiển thị vị trí của mô phỏng
- Cung cấp method `centerToDevice()` để center map tới vị trí device
- Config map: default center là Hà Nội (21.0285, 105.8542), zoom level 15

---

### 2. **InfoPanel.jsx**

**Vị trí:** `src/components/InfoPanel.jsx`

**Chức năng:** Panel bên phải chứa tất cả control và form, chia thành 4 tabs chính.

**Chi tiết:**

- 4 Tab chính:
  1. **Devices Tab**: Hiển thị danh sách thiết bị, thêm device mới
  2. **Search Tab**: Tìm kiếm địa chỉ, tìm tuyến đường A → B
  3. **Simulation Tab**: Mô phỏng di chuyển của thiết bị
  4. **History Tab**: Xem lịch sử di chuyển của thiết bị
- Nhận props từ App.jsx để điều khiển state
- Hiển thị loading states, error messages, kết quả tìm kiếm
- Quản lý form input và validations

---

### 3. **DeviceForm.jsx**

**Vị trí:** `src/components/DeviceForm.jsx`

**Chức năng:** Form để thêm thiết bị mới vào hệ thống.

**Chi tiết:**

- Có 2 input:
  1. Tên thiết bị (text input)
  2. Vị trí (AutoComplete search field)
- Validate: Tên thiết bị và vị trí phải được chọn
- Khi submit, gọi callback `onAddDevice()` với object: `{name, latitude, longitude, address}`
- Reset form sau khi thêm thành công

---

### 4. **DeviceList.jsx**

**Vị trí:** `src/components/DeviceList.jsx`

**Chức năng:** Danh sách các thiết bị được lưu, cho phép chọn và xoá.

**Chi tiết:**

- Hiển thị list các device dưới dạng cards
- Mỗi card DeviceItem hiển thị:
  - Tên thiết bị (với badge "Đã chọn" nếu selected)
  - Device ID
  - Địa chỉ (text truncate)
  - Tọa độ (latitude, longitude)
  - Thời gian được thêm
- Nút "✕" để xoá device
- Click card để chọn device
- Highlight selected device (bg-blue-50, border-blue-400)

---

### 5. **DeviceMarker.jsx**

**Vị trí:** `src/components/DeviceMarker.jsx`

**Chức năng:** Marker hiển thị trên bản đồ cho từng thiết bị.

**Chi tiết:**

- Tạo marker icon custom với thiết kế: hình tròn xanh gradient + chân pin
- Icon size: 32x40px
- Popup hiển thị khi click: tên device, ID, địa chỉ, thời gian
- Update vị trí marker khi device location thay đổi
- Remove marker khi device bị xoá

---

### 6. **DeviceSelector.jsx**

**Vị trí:** `src/components/DeviceSelector.jsx`

**Chức năng:** Dropdown select để chọn thiết bị (tái sử dụng trong simulation, history tabs).

**Chi tiết:**

- Hiển thị danh sách devices dưới dạng dropdown
- Option items hiển thị: `{device.name} ({device.id})`
- Hiển thị info card của device đã chọn
- Callbacks: `onChange()` và `onSelectGlobal()`

---

### 7. **AutoComplete.jsx**

**Vị trị:** `src/components/AutoComplete.jsx`

**Chức năng:** Component tìm kiếm autocomplete dùng Nominatim API.

**Chi tiết:**

- Input text field + dropdown suggestions
- Integrate `useNominatimSearch` hook để tìm kiếm địa chỉ
- Debounce search queries (mặc định 800ms)
- Dropdown được portal vào fixed position để không bị clip
- Status text: "Đang tìm…", "Không có kết quả", errors, etc.
- Click suggestion → select place, close dropdown
- Props: `label`, `placeholder`, `onSelect`, `onClear`, `minChars`

---

### 8. **ResultCard.jsx**

**Vị trí:** `src/components/ResultCard.jsx`

**Chức năng:** Reusable component để hiển thị result/error/empty state của search results.

**Chi tiết:**

- Props: `error`, `data`, `emptyMessage`, `children`
- Hiển thị error message (red background nếu có lỗi)
- Hiển thị empty message nếu không có data
- Wrapper cho kết quả (blue background nếu có data)

---

### 9. **HistoryRoute.jsx**

**Vị trí:** `src/components/HistoryRoute.jsx`

**Chức năng:** Vẽ tuyến đường lịch sử di chuyển của thiết bị lên bản đồ.

**Chi tiết:**

- Draw polyline thể hiện đường đã đi
- Hiển thị markers:
  - **Start flag** (xanh): vị trí bắt đầu
  - **End pin** (đỏ): vị trí kết thúc
  - **Distance label**: hiển thị tổng quãng đường (km)
  - **Sequence markers**: hiển thị các điểm trung gian (only intermediate points)
- Sequence markers có tooltip hiển thị thời gian + tọa độ
- Auto fit map bounds khi hiển thị route
- Cleanup layers khi component unmount

---

### 10. **SimulationMarkers.jsx**

**Vị trị:** `src/components/SimulationMarkers.jsx`

**Chức năng:** Marker hiển thị vị trí hiện tại khi đang mô phỏng di chuyển.

**Chi tiết:**

- Icon custom: hình tròn xanh với emoji 🚚
- Update vị trí marker real-time khi mô phỏng chạy
- Remove marker khi mô phỏng kết thúc
- Dùng divIcon của Leaflet để custom style

---

## 🔧 Hooks Folder (Logic và State Management)

### 1. **useDevices.js**

**Vị trị:** `src/hooks/useDevices.js`

**Chức năng:** Hook quản lý toàn bộ device state và lưu vào localStorage.

**Chi tiết:**

- **State & Storage:**
  - Lưu trong localStorage với key: `tracking_map_devices`
  - Format: JSON array của objects device
  - Mỗi device object chứa: `{id, name, latitude, longitude, address, timestamp, selected}`
- **Functions:**
  - `addDevice({name, latitude, longitude, address})` - Tạo device mới với ID = timestamp
  - `removeDevice(id)` - Xoá device và xoá hết movement history của nó
  - `selectDevice(id)` - Đánh dấu device được chọn (set selected = true)
  - `getSelectedDevice()` - Get device hiện tại được chọn
  - `updateDevice(id, updates)` - Update device properties + timestamp
  - `saveMovementRecord(deviceId, latitude, longitude)` - Lưu 1 record di chuyển vào localStorage key: `tracking_map_movement_{deviceId}`
  - `getMovementHistory(deviceId)` - Lấy danh sách toàn bộ movement records của device
- **Error handling:** Safe JSON parse/stringify với try-catch

---

### 2. **useMovementHistory.js**

**Vị trị:** `src/hooks/useMovementHistory.js`

**Chức năng:** Hook tính toán và lọc lịch sử di chuyển của device trong khoảng thời gian chỉ định.

**Chi tiết:**

- **State:** `loading`, `error`, `historyData`
- **Main function:** `getHistoryRoute(deviceId, startTime, endTime)`
  - Lấy toàn bộ movement records từ localStorage key: `tracking_map_movement_{deviceId}`
  - Filter records theo khoảng thời gian
  - Tính toán:
    - **distance**: Tính khoảng cách giữa các points bằng công thức Haversine
    - **duration**: Thời gian từ record đầu đến record cuối
    - **latlngs**: Array [lat, lng] để vẽ polyline
    - **recordCount**: Số lượng records
- **Error handling:**
  - Device không có lịch sử → error message
  - Không có record trong khoảng thời gian → error message
  - Lỗi JSON parse → error message

- **Haversine formula:** Để tính khoảng cách giữa 2 points trên bề mặt trái đất (sử dụng Earth radius = 6371km)

---

### 3. **useNominatimSearch.js**

**Vị trị:** `src/hooks/useNominatimSearch.js`

**Chức năng:** Hook tìm kiếm địa chỉ dùng Nominatim API (OpenStreetMap geocoding service).

**Chi tiết:**

- **API:** Gọi `/nominatim/search` endpoint (proxy path)
- **Params:**
  - `format=jsonv2`
  - `addressdetails=1` (chi tiết địa chỉ)
  - `limit=6` (max results)
  - Query string từ user input
- **State:** `loading`, `error`, `items` (list places)
- **Main function:** `search(query)`
  - Validate: query phải >= 3 ký tự
  - Debounce search (config từ constants)
  - Abort previous requests nếu có request mới
  - Track request ID để prevent race conditions
  - Convert Nominatim response → Place object: `{id, name, lat, lng, raw}`
- **Error handling:** Network errors, malformed responses

---

### 4. **useOsrmRoute.js**

**Vị trị:** `src/hooks/useOsrmRoute.js`

**Chức năng:** Hook tìm tuyến đường giữa 2 điểm dùng OSRM API (Open Source Routing Machine).

**Chi tiết:**

- **API:** Gọi `/osrm/route/v1/{profile}` endpoint (proxy path)
- **Profile:** `driving` (xe hơi)
- **Params:** `overview=simplified`, `geometries=geojson`
- **State:** `loading`, `error`, `route`
- **Cache mechanism:**
  - LRU cache max 50 routes (để tránh gọi API lặp lại)
  - Cache TTL: 5 phút
  - Auto cleanup expired entries
- **Main function:** `getRoute({from, to})`
  - from/to phải là object: `{lat?, latitude?, lng?, longitude?}`
  - Tạo cache key từ tọa độ (rounded to 6 decimal places)
  - Check cache trước, nếu hit thì return cached
  - Gọi API nếu cache miss
  - Convert OSRM GeoJSON response (lng, lat) → [lat, lng] array
  - Return object: `{distance (meters), duration (seconds), latlngs}`
- **Error handling:** Validation, network errors, invalid response

---

### 5. **useSimulation.js**

**Vị trị:** `src/hooks/useSimulation.js`

**Chức năng:** Hook để mô phỏng di chuyển của thiết bị theo một tuyến đường.

**Chi tiết:**

- **State:** `playing`, `currentPosition`, `latlngs`
- **Main function:** `start(points, durationSeconds, onMovementSave, destination)`
  - `points`: Array [lat, lng] của tuyến đường
  - `durationSeconds`: Số giây để hoàn thành mô phỏng
  - `onMovementSave`: Callback tính hàng giây để lưu position
  - `destination`: Vị trí đích (dùng để cập nhật device khi xong)
  - Dùng `requestAnimationFrame` để animate smooth
  - Tính progress = elapsed / duration, interpolate position trên route
  - Save movement records periodically (callback ngoài quản lý)
  - Khi hoàn thành, save final position với destination coords
- **Utility functions:**
  - `reset()`: Stop + clear trạng thái
  - `stopInternal()`: Dừng animation frame
- **Key details:**
  - Tránh race conditions bằng ref.current (playingRef, stateRef)
  - Interpolate giữa 2 points nearby khi progress không nguyên

---

### 6. **useDebounce.js**

**Vị trị:** `src/hooks/useDebounce.js`

**Chức năng:** Hook utility để debounce value (trì hoãn update khi value thay đổi liên tục).

**Chi tiết:**

- **Params:** `value` (giá trị input), `delayMs` (độ trì hoãn)
- **Return:** Debounced value
- **Cách hoạt động:**
  - Set timeout khi value thay đổi
  - Nếu value thay đổi lại trước timeout hết → clear timeout, set timer mới
  - Chỉ update debounced state sau `delayMs` khi không có thay đổi mới
- **Sử dụng:** Debounce search queries trong AutoComplete (800ms), Nominatim search (800ms)

---

## ⚙️ Constants Folder (Cấu hình và Hằng số)

### 1. **index.js**

**Vị trization:** `src/constants/index.js`

**Chức năng:** Tập trung các config và constants của toàn ứng dụng.

**Chi tiết:**

**API Configs:**

- `NOMINATIM_CONFIG`:
  - `PROXY_PATH: "/nominatim/search"`
  - `MIN_CHARS: 3` (min chars để search)
  - `DEBOUNCE_MS: 800` (debounce delay)
  - `REQUEST_LIMIT: 6` (max results per request)

- `OSRM_CONFIG`:
  - `PROXY_PATH: "/osrm/route/v1"`
  - `PROFILE: "driving"`
  - `OVERVIEW: "simplified"`
  - `GEOMETRIES: "geojson"`

**Map Configs:**

- `MAP_CONFIG`:
  - `DEFAULT_CENTER: [21.0285, 105.8542]` (Hà Nội)
  - `DEFAULT_ZOOM: 15`
  - `SEARCH_ZOOM: 16`
  - `TILE_URL` (OpenStreetMap tiles)

- `OSM_ATTRIBUTION` (copyright text)

**Marker Styles:**

- `SEARCH_MARKER`: radius 10, blue (#2563eb), fillOpacity 0.35
- `ROUTE_STYLE`: blue, weight 5, opacity 0.9

**UI Tabs:**

- `TABS`: Array định nghĩa 4 tabs: devices, search, simulation, history

**Labels & Text (Vietnamese):**

- `PANEL_TITLES`: Title + subtitle cho mỗi panel
- `DEVICE_FORM_LABELS`: Labels cho form thêm device
- `DEVICE_LIST_LABELS`: Labels cho device list
- `SEARCH_PANEL_LABELS`: Labels cho search tab
- `SIMULATION_PANEL_LABELS`: Labels cho simulation tab
- `HISTORY_PANEL_LABELS`: Labels cho history tab

---

### 2. **markerIcons.js**

**Vị trị:** `src/constants/markerIcons.js`

**Chức năng:** Factory functions để tạo custom marker icons dùng Leaflet divIcon.

**Chi tiết:**

**Function 1: `buildStartFlagIcon()`**

- Tạo icon dạng cờ (flag) màu xanh cho điểm bắt đầu
- Size: 30x38px
- Gradient từ #22c55e (xanh nhạt) → #15803d (xanh đậm)
- Drop shadow

**Function 2: `buildEndPinIcon()`**

- Tạo icon dạng pin/marker màu đỏ cho điểm kết thúc
- Size: 34x40px
- Gradient từ #ef4444 (đỏ nhạt) → #b91c1c (đỏ đậm)
- Chứa text "ⓑ" ở giữa
- Drop shadow

**Function 3: `buildDistanceIcon(kmText)`**

- Tạo icon label cho hiển thị quãng đường
- Input: `kmText` (e.g., "5.2 km")
- Style: white background, border, shadow, centered text
- Size: 120x32px

**Function 4: `createSequenceMarkerIcon(index)`**

- Tạo icon cho các điểm trung gian trên route
- Input: `index` (số thứ tự)
- Hiển thị số thứ tự bên trong icon

---

## 🛠 Utils Folder (Utility Functions)

### 1. **format.js**

**Vị trị:** `src/utils/format.js`

**Chức năng:** Format các giá trị số (khoảng cách, thời gian) thành string hiển thị cho user.

**Chi tiết:**

**Function 1: `formatDistance(meters)`**

- Chuyển đổi từ meters → km
- Nếu >= 10 km: 1 decimal place (e.g., "5.2 km")
- Nếu < 10 km: 2 decimal places (e.g., "2.15 km")

**Function 2: `formatDurationSeconds(seconds)`**

- Chuyển đổi giây → phút
- Round to nearest minute
- Return: number (e.g., 125 seconds → 2 phút)

**Function 3: `formatDurationMilliseconds(milliseconds)`**

- Chuyển đổi milliseconds → giây
- Round to nearest second
- Return: number

---

### 2. **mapCleanup.js**

**Vị trị:** `src/utils/mapCleanup.js`

**Chức năng:** Utility function để cleanup Leaflet map layers (tránh memory leaks).

**Chi tiết:**

**Function: `cleanupMapLayers(map, ...refs)`**

- Input: `map` (Leaflet map instance), `...refs` (refs của các layers)
- Loại bỏ từng layer khỏi map: `map.removeLayer(ref.current)`
- Set ref.current = null để xoá reference
- Dùng trong HistoryRoute, MapView để cleanup khi component unmount hoặc data thay đổi
- Tránh multiple layers stack up trên map

---

## 📊 Data Flow Overview

```
App.jsx (Main Controller)
├── useDevices Hook
│   └── localStorage: "tracking_map_devices"
│       └── Movement History Storage: "tracking_map_movement_{deviceId}"
│
├── useNominatimSearch Hook
│   └── Nominatim API → Search results
│
├── useOsrmRoute Hook
│   └── OSRM API → Route data (distance, duration, path)
│
├── useSimulation Hook
│   └── Animate along route → saveMovementRecord() → localStorage
│
└── useMovementHistory Hook
    └── Read localStorage + calculate distance/duration

InfoPanel.jsx (UI Controls)
├── DeviceForm → addDevice()
├── DeviceList → selectDevice() / removeDevice()
├── AutoComplete → Search places
├── Device/Route/Simulation/History selectors
│
MapView.jsx (Map Display)
├── SearchMarker → Show selected place
├── RouteLayer → Show A→B route
├── DeviceMarker (x N) → Show all devices
├── SimulationMarkers → Show simulation position
└── HistoryRoute → Show movement history path
```

---

## 🔑 Storage Structure (localStorage)

**Devices Storage:**

```json
localStorage["tracking_map_devices"] = [
  {
    "id": "1710576000000",
    "name": "Xe tải A",
    "latitude": 21.0285,
    "longitude": 105.8542,
    "address": "123 Phố..., Hà Nội",
    "timestamp": 1710576120000,
    "selected": true
  }
]
```

**Movement History (Per Device):**

```json
localStorage["tracking_map_movement_1710576000000"] = [
  {
    "device_id": "1710576000000",
    "latitude": 21.0456,
    "longitude": 105.8678,
    "timestamp": 1710576120000
  }
]
```

---

## 🎯 Feature Summary

| Feature           | Component(s)                      | Hook(s)            | Storage                |
| ----------------- | --------------------------------- | ------------------ | ---------------------- |
| Device Management | DeviceForm, DeviceList            | useDevices         | localStorage           |
| Search Location   | AutoComplete, SearchMarker        | useNominatimSearch | (API)                  |
| Find Route        | AutoComplete, RouteLayer          | useOsrmRoute       | (API, cached)          |
| Simulation        | SimulationMarkers, DeviceSelector | useSimulation      | localStorage (history) |
| Movement History  | HistoryRoute, DeviceSelector      | useMovementHistory | localStorage           |
