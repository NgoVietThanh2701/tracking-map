import * as deviceAPI from "../api/device";

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
      // Ensure devices have the required fields for UI
      return Array.isArray(devices)
        ? devices.map((device) => ({
            id: device.id,
            device_id: device.id,
            uuid: device.uuid,
            name: device.name,
            latitude: device.latitude,
            longitude: device.longitude,
            address: device.address || "",
            timestamp:
              device.updated_at ||
              device.created_at ||
              new Date().toISOString(),
            selected: false,
          }))
        : [];
    } catch (error) {
      console.error("Error fetching devices:", error);
      throw error;
    }
  }

  /**
   * Create a new device
   */
  async createDevice(deviceData) {
    try {
      const newDevice = await deviceAPI.createDevice({
        name: deviceData.name,
        latitude: deviceData.latitude,
        longitude: deviceData.longitude,
        address: deviceData.address,
      });

      // Transform response to match UI expectations
      return {
        id: newDevice.id,
        device_id: newDevice.id,
        name: newDevice.name,
        latitude: newDevice.latitude,
        longitude: newDevice.longitude,
        address: newDevice.address || "",
        timestamp:
          newDevice.updated_at ||
          newDevice.created_at ||
          new Date().toISOString(),
        selected: false,
      };
    } catch (error) {
      console.error("Error creating device:", error);
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
      console.error("Error deleting device:", error);
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

      return {
        id: updatedDevice.id,
        device_id: updatedDevice.id,
        name: updatedDevice.name,
        latitude: updatedDevice.latitude,
        longitude: updatedDevice.longitude,
        address: updatedDevice.address || "",
        timestamp:
          updatedDevice.updated_at ||
          updatedDevice.created_at ||
          new Date().toISOString(),
        selected: false,
      };
    } catch (error) {
      console.error("Error updating device address:", error);
      throw error;
    }
  }
}

export default new DeviceService();
