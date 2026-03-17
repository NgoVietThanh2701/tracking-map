import * as deviceAPI from "../api/device";
import { transformDevices, transformDevice } from "../utils/deviceTransform";
import { ERROR_MESSAGES } from "../constants";

/**
 * Device Service - handles business logic for device management
 */

class DeviceService {
  /**
   * Fetch all devices from the backend
   */
  async getAllDevices() {
    try {
      const devices = await deviceAPI.getDevices();
      return transformDevices(devices);
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_DEVICES, error);
      throw error;
    }
  }

  /**
   * Create a new device
   */
  async createDevice(deviceData) {
    try {
      const newDevice = await deviceAPI.createDevice(deviceData);
      return transformDevice(newDevice);
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_DEVICE, error);
      throw error;
    }
  }

  /**
   * Delete a device
   */
  async deleteDevice(deviceId) {
    try {
      await deviceAPI.deleteDevice(deviceId);
      return deviceId;
    } catch (error) {
      console.error(ERROR_MESSAGES.DELETE_DEVICE, error);
      throw error;
    }
  }

  /**
   * Update device address (can also update latitude, longitude)
   */
  async updateDeviceAddress(deviceId, { address, latitude, longitude }) {
    try {
      const updatedDevice = await deviceAPI.updateDeviceAddress(deviceId, {
        address,
        latitude,
        longitude,
      });

      return transformDevice(updatedDevice);
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATE_DEVICE, error);
      throw error;
    }
  }
}

export default new DeviceService();
