export default function DeviceSelector({
  value,
  onChange,
  devices,
  label,
  placeholder,
  onSelectGlobal,
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wide text-gray-500 mb-2">
        {label}
      </label>
      <select
        value={value ? value.id : ""}
        onChange={(e) => {
          const selectedId = e.target.value;
          if (selectedId) {
            const device = devices.find((d) => d.id === selectedId);
            onChange?.(device);
            onSelectGlobal?.(device.id);
          } else {
            onChange?.(null);
          }
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
      >
        <option value="">{placeholder}</option>
        {devices.map((device) => (
          <option key={device.id} value={device.id}>
            {device.name} ({device.device_id || device.id})
          </option>
        ))}
      </select>

      {value && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
          <div className="text-xs font-medium text-gray-600">Thiết bị:</div>
          <div className="font-medium mt-1">{value.name}</div>
          <div className="text-xs text-gray-600">{value.address}</div>
        </div>
      )}
    </div>
  );
}
