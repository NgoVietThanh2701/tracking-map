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
        <div
          key={device.id}
          onClick={() => onSelectDevice(device.id)}
          className={[
            "p-3 rounded-lg border transition-colors cursor-pointer",
            device.selected
              ? "bg-blue-50 border-blue-400 ring-2 ring-blue-200"
              : "bg-gray-50 border-gray-200 hover:bg-gray-100",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate flex items-center gap-2">
                {device.name}
                {device.selected && (
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
              onClick={(e) => {
                e.stopPropagation();
                onRemove(device.id);
              }}
              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors shrink-0"
              title="Xoá thiết bị"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
