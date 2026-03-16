import { memo, useState } from "react";
import AutoComplete from "./AutoComplete";

const DeviceForm = memo(function DeviceForm({ onAddDevice }) {
  const [name, setName] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearCounter, setClearCounter] = useState(0);

  const handleInputChange = (e) => {
    setName(e.target.value);
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
  };

  const handleClearPlace = () => {
    setSelectedPlace(null);
  };

  const handleAddDevice = async () => {
    if (!name.trim()) {
      alert("Vui lòng nhập tên thiết bị");
      return;
    }

    if (!selectedPlace) {
      alert("Vui lòng chọn vị trí cho thiết bị");
      return;
    }

    setLoading(true);
    try {
      await onAddDevice({
        name: name.trim(),
        latitude: selectedPlace.lat,
        longitude: selectedPlace.lng,
        address: selectedPlace.name,
      });

      // Reset form
      setName("");
      setSelectedPlace(null);
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
          value={name}
          onChange={handleInputChange}
          placeholder="VD: Xe tải A, Xe máy B..."
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

      {selectedPlace && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
          <div className="font-medium">{selectedPlace.name}</div>
          <div className="text-xs text-gray-600 mt-1">
            {selectedPlace.lat.toFixed(6)}, {selectedPlace.lng.toFixed(6)}
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
});

DeviceForm.displayName = "DeviceForm";
export default DeviceForm;
