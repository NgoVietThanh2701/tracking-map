/**
 * Transform device data from API format to UI format
 */
export const transformDevice = (apiDevice) => {
  if (!apiDevice) return null;

  return {
    id: apiDevice.id,
    uuid: apiDevice.uuid,
    name: apiDevice.name,
    latitude: apiDevice.latitude,
    longitude: apiDevice.longitude,
    address: apiDevice.address || "",
    timestamp:
      apiDevice.updated_at || apiDevice.created_at || new Date().toISOString(),
  };
};

/**
 * Transform array of devices
 */
export const transformDevices = (apiDevices) => {
  if (!Array.isArray(apiDevices)) return [];
  return apiDevices.map(transformDevice).filter(Boolean);
};
