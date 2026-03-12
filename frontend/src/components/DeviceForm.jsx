import { useState } from "react";
import AutoComplete from "./AutoComplete";

export default function DeviceForm({ onAddDevice }) {
  const [formData, setFormData] = useState({
    name: "",
    device_id: "",
    selectedPlace: null,
  });
  const [loading, setLoading] = useState(false);
  const [clearCounter, setClearCounter] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceSelect = (place) => {
    setFormData((prev) => ({ ...prev, selectedPlace: place }));
  };

  const handleClearPlace = () => {
    setFormData((prev) => ({ ...prev, selectedPlace: null }));
  };

  const handleAddDevice = async () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên thiết bị");
      return;
    }

    if (!formData.device_id.trim()) {
      alert("Vui lòng nhập ID thiết bị");
      return;
    }

    if (!formData.selectedPlace) {
      alert("Vui lòng chọn vị trí cho thiết bị");
      return;
    }

    setLoading(true);
    try {
      await onAddDevice({
        name: formData.name.trim(),
        device_id: formData.device_id.trim(),
        latitude: formData.selectedPlace.lat,
        longitude: formData.selectedPlace.lng,
        address: formData.selectedPlace.name,
      });

      // Reset form
      setFormData({
        name: "",
        device_id: "",
        selectedPlace: null,
      });
      setClearCounter((prev) => prev + 1);
    } catch (error) {
      alert("Có lỗi xảy ra khi thêm thiết bị");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="device-name"
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          Tên thiết bị
        </label>
        <input
          id="device-name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="VD: Xe tải A, Xe máy B..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="device-id"
          className="block text-xs font-medium text-gray-700 mb-1"
        >
          ID thiết bị
        </label>
        <input
          id="device-id"
          type="text"
          name="device_id"
          value={formData.device_id}
          onChange={handleInputChange}
          placeholder="VD: DEV001, GPS-123..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Tìm kiếm vị trí
        </label>
        <AutoComplete
          key={clearCounter}
          placeholder="Nhập địa chỉ để tìm vị trí"
          onSelect={handlePlaceSelect}
          onClear={handleClearPlace}
          minChars={2}
        />
      </div>

      {formData.selectedPlace && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
          <div className="font-medium">{formData.selectedPlace.name}</div>
          <div className="text-xs text-gray-600 mt-1">
            {formData.selectedPlace.lat.toFixed(6)},{" "}
            {formData.selectedPlace.lng.toFixed(6)}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleAddDevice}
        disabled={loading}
        className={[
          "w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          loading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700",
        ].join(" ")}
      >
        {loading ? "Đang thêm..." : "➕ Thêm thiết bị"}
      </button>
    </div>
  );
}
