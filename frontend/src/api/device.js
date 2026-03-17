import axiosInstance from "./axios";
import { handleApiError } from "../utils/apiErrorHandler";
import { ERROR_MESSAGES } from "../constants";

/**
 * Device API endpoints
 */

// Get all devices
export const getDevices = async () => {
  try {
    const response = await axiosInstance.get("/devices");
    return response.data;
  } catch (error) {
    handleApiError(error, ERROR_MESSAGES.FETCH_DEVICES);
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
    handleApiError(error, ERROR_MESSAGES.CREATE_DEVICE);
  }
};

// Delete a device
export const deleteDevice = async (deviceId) => {
  try {
    const response = await axiosInstance.delete(`/devices/${deviceId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, ERROR_MESSAGES.DELETE_DEVICE);
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
    handleApiError(error, ERROR_MESSAGES.UPDATE_DEVICE);
  }
};
