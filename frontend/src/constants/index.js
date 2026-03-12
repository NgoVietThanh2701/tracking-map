// Tab definitions
export const TABS = [
  { id: "devices", label: "Thiết bị", icon: "📱" },
  { id: "search", label: "Tìm kiếm", icon: "🔎" },
  { id: "route", label: "Chỉ đường", icon: "🧭" },
];

// API Configuration
export const NOMINATIM_CONFIG = {
  PROXY_PATH: "/nominatim/search",
  MIN_CHARS: 3,
  DEBOUNCE_MS: 800,
  REQUEST_LIMIT: 6,
  USER_AGENT: "TrackingMap/1.0 (mapping application)",
};

export const OSRM_CONFIG = {
  PROXY_PATH: "/osrm/route/v1",
  PROFILE: "driving",
  OVERVIEW: "full",
  GEOMETRIES: "geojson",
};

// Map Configuration
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const MAP_CONFIG = {
  DEFAULT_ZOOM: 15,
  SEARCH_ZOOM: 16,
  TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
};

// Marker Configuration
export const LOCATION_MARKER = {
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
};

export const SEARCH_MARKER = {
  radius: 10,
  color: "#2563eb",
  weight: 3,
  fillColor: "#60a5fa",
  fillOpacity: 0.35,
};

export const ROUTE_STYLE = {
  color: "#2563eb",
  weight: 5,
  opacity: 0.9,
};

// UI Text Constants
export const PANEL_TITLES = {
  DEVICES: {
    title: "Quản lý thiết bị",
    subtitle: "Thêm và chọn thiết bị để hiển thị",
  },
  SEARCH: {
    title: "Tìm kiếm địa chỉ",
    subtitle: "Gõ để tìm và chọn kết quả",
  },
  ROUTE: {
    title: "Tìm quãng đường đi",
    subtitle: "Nhập 2 vị trí A → B",
  },
};

export const DEVICE_FORM_LABELS = {
  NAME: "Tên thiết bị",
  NAME_PLACEHOLDER: "VD: Xe tải A, Xe máy B...",
  DEVICE_ID: "ID thiết bị",
  DEVICE_ID_PLACEHOLDER: "VD: DEV001, GPS-123...",
  LOCATION: "Tìm kiếm vị trí",
  LOCATION_PLACEHOLDER: "Nhập địa chỉ để tìm vị trí",
  ADD_BUTTON: "➕ Thêm thiết bị",
  ADDING: "Đang thêm...",
};

export const DEVICE_LIST_LABELS = {
  EMPTY: "Chưa có thiết bị nào được thêm",
  DEVICE_COUNT: "Danh sách thiết bị",
  SELECT_LABEL: "Chọn thiết bị",
  SELECT_PLACEHOLDER: "-- Chọn thiết bị --",
  DELETE: "✕",
  SELECTED_BADGE: "Đã chọn",
};

export const DEVICE_INFO_LABELS = {
  LATITUDE: "Vĩ độ",
  LONGITUDE: "Kinh độ",
  ADDRESS: "Địa chỉ",
  ADDED_DATE: "Thêm vào",
};

export const SEARCH_PANEL_LABELS = {
  INPUT_LABEL: "Nhập địa chỉ",
  INPUT_PLACEHOLDER: "Ví dụ: 1 Võ Văn Ngân, Thủ Đức…",
  HELP_TEXT: "Chọn một kết quả để đặt marker lên bản đồ.",
  SELECTED: "Đã chọn:",
};

export const ROUTE_PANEL_LABELS = {
  FROM_LABEL: "Điểm A",
  FROM_PLACEHOLDER: "Nhập vị trí bắt đầu…",
  TO_LABEL: "Điểm B",
  TO_PLACEHOLDER: "Nhập vị trí đến…",
  FIND_BUTTON: "Tìm đường",
  FINDING: "Đang tìm đường…",
  CLEAR_BUTTON: "Xóa tuyến",
  DISTANCE: "Quãng đường:",
  DURATION: "Thời gian:",
  KM: "km",
  MINUTES: "phút",
  ROUTE_INFO: "Tuyến đường",
  NO_SELECTION: 'Chọn A và B, sau đó nhấn "Tìm đường".',
};
