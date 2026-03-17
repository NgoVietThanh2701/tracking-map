import { memo, useCallback, useState } from "react";

const DeviceItem = memo(function DeviceItem({
  device,
  isSelected,
  onSelect,
  onRemove,
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = useCallback(
    async (e) => {
      e.stopPropagation();
      setIsRemoving(true);
      try {
        await onRemove(device.id);
      } catch (error) {
        console.error("Failed to remove device:", error);
        setIsRemoving(false);
      }
    },
    [device.id, onRemove],
  );

  const handleSelect = useCallback(() => {
    onSelect(device.id);
  }, [device.id, onSelect]);

  return (
    <div
      onClick={handleSelect}
      className={[
        "p-3 rounded-lg border transition-colors cursor-pointer",
        isSelected
          ? "bg-blue-50 border-blue-400 ring-2 ring-blue-200"
          : "bg-gray-50 border-gray-200 hover:bg-gray-100",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900 truncate flex items-center gap-2">
            {device.name}
            {isSelected && (
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                Đã chọn
              </span>
            )}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            <div>ID: {device.device_id || device.id}</div>
            <div className="truncate">{device.address}</div>
            <div className="mt-1 font-mono text-xs text-gray-500">
              {device.latitude.toFixed(6)}, {device.longitude.toFixed(6)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(device.timestamp).toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          className={[
            "px-2 py-1 text-xs rounded transition-colors shrink-0",
            isRemoving
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-red-100 text-red-700 hover:bg-red-200",
          ].join(" ")}
          title="Xoá thiết bị"
        >
          {isRemoving ? "..." : "✕"}
        </button>
      </div>
    </div>
  );
});

export default function DeviceList({ devices, onSelectDevice, onRemove }) {
  if (devices.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Chưa có thiết bị nào được thêm</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {devices.map((device) => (
        <DeviceItem
          key={device.id}
          device={device}
          isSelected={device.selected}
          onSelect={onSelectDevice}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
