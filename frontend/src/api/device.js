import axiosInstance from "./axios";

/**
 * Device API endpoints
 */

// Get all devices
export const getDevices = async () => {
  try {
    const response = await axiosInstance.get("/devices");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch devices");
  }
};

// Create a new device
export const createDevice = async (deviceData) => {
  try {
    const response = await axiosInstance.post("/devices", {
      name: deviceData.name,
      latitude: deviceData.latitude,
      longitude: deviceData.longitude,
      address: deviceData.address,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create device");
  }
};

// Delete a device
export const deleteDevice = async (deviceId) => {
  try {
    const response = await axiosInstance.delete(`/devices/${deviceId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to delete device");
  }
};

// Update device address (can also include latitude, longitude)
export const updateDeviceAddress = async (
  deviceId,
  { address, latitude, longitude },
) => {
  try {
    const payload = { address };
    if (latitude !== undefined) payload.latitude = latitude;
    if (longitude !== undefined) payload.longitude = longitude;

    const response = await axiosInstance.patch(
      `/devices/${deviceId}/address`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to update device address",
    );
  }
};
