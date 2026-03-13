// Tab definitions
export const TABS = [
  { id: "devices", label: "Thiết bị", icon: "📱" },
  { id: "search", label: "Tìm kiếm", icon: "🔎" },
  { id: "simulation", label: "Mô phỏng", icon: "🚚" },
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
  OVERVIEW: "simplified",
  GEOMETRIES: "geojson",
};

// Map Configuration
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const MAP_CONFIG = {
  DEFAULT_CENTER: [21.0285, 105.8542],
  DEFAULT_ZOOM: 15,
  SEARCH_ZOOM: 16,
  TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
};

// Marker Configuration
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
  SIMULATION: {
    title: "Mô phỏng di chuyển",
    subtitle: "",
  },
};

export const DEVICE_FORM_LABELS = {
  NAME: "Tên thiết bị",
  NAME_PLACEHOLDER: "VD: Xe tải A, Xe máy B...",
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
  FIND_ROUTE_LABEL: "Tìm đường từ A đến B",
  FROM_LABEL: "Điểm A",
  FROM_PLACEHOLDER: "Nhập vị trí bắt đầu…",
  TO_LABEL: "Điểm B",
  TO_PLACEHOLDER: "Nhập vị trí đến…",
  FIND_BUTTON: "Tìm đường",
  FINDING: "Đang tìm đường…",
  CLEAR_BUTTON: "Xóa tuyến",
  ROUTE_INFO: "Tuyến đường",
  DISTANCE: "Quãng đường:",
  DURATION: "Thời gian:",
  KM: "km",
  MINUTES: "phút",
  NO_SELECTION: 'Chọn A và B, sau đó nhấn "Tìm đường".',
};

export const SIMULATION_PANEL_LABELS = {
  DEVICE_LABEL: "Chọn thiết bị mô phỏng",
  DEVICE_PLACEHOLDER: "-- Chọn thiết bị --",
  DESTINATION_LABEL: "Điểm đến",
  DESTINATION_PLACEHOLDER: "Nhập địa chỉ điểm đến…",
  SPEED_LABEL: "Thời gian mô phỏng (giây)",
  STOP_BUTTON: "Dừng mô phỏng",
  PLAY_BUTTON: "Bắt đầu mô phỏng",
};
