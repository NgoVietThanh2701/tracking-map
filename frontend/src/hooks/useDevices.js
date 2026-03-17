import { useState, useEffect, useCallback } from "react";
import deviceService from "../services/deviceService";

const MOVEMENT_HISTORY_PREFIX = "tracking_map_movement_";
const SELECTED_DEVICE_KEY = "tracking_map_selected_device_id";

// Helper functions for localStorage (for movement history)
const safeJsonParse = (json, fallback = null) => {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return fallback;
  }
};

export function useDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch devices from backend on mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await deviceService.getAllDevices();

        // Get previously selected device ID from localStorage
        const savedSelectedId = localStorage.getItem(SELECTED_DEVICE_KEY);

        // Mark device as selected if it exists in the new data
        const devicesWithSelection = data.map((d) => ({
          ...d,
          selected: savedSelectedId
            ? d.id === parseInt(savedSelectedId, 10)
            : false,
        }));

        setDevices(devicesWithSelection);
      } catch (err) {
        console.error("Failed to fetch devices:", err);
        setError(err.message);
        setDevices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const addDevice = useCallback(async (device) => {
    try {
      setError(null);
      const newDevice = await deviceService.createDevice({
        name: device.name,
        latitude: device.latitude,
        longitude: device.longitude,
        address: device.address,
      });
      setDevices((prev) => [newDevice, ...prev]);
      return newDevice;
    } catch (err) {
      console.error("Failed to add device:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  const removeDevice = useCallback(async (id) => {
    try {
      setError(null);
      await deviceService.deleteDevice(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));

      // Clean up movement history
      try {
        localStorage.removeItem(`${MOVEMENT_HISTORY_PREFIX}${id}`);
      } catch (err) {
        console.error("Failed to remove movement history:", err);
      }

      // If removed device was selected, clear from localStorage
      const selectedId = localStorage.getItem(SELECTED_DEVICE_KEY);
      if (selectedId && parseInt(selectedId, 10) === id) {
        localStorage.removeItem(SELECTED_DEVICE_KEY);
      }
    } catch (err) {
      console.error("Failed to remove device:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  const selectDevice = useCallback((id) => {
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        selected: d.id === id,
      })),
    );
    // Save selected device ID to localStorage
    localStorage.setItem(SELECTED_DEVICE_KEY, String(id));
  }, []);

  const getSelectedDevice = useCallback(() => {
    return devices.find((d) => d.selected) || null;
  }, [devices]);

  const updateDevice = useCallback(async (id, updates) => {
    try {
      setError(null);
      // Update to backend (address, latitude, longitude)
      const updatedDevice = await deviceService.updateDeviceAddress(id, {
        address: updates.address,
        latitude: updates.latitude,
        longitude: updates.longitude,
      });

      // Update local state
      setDevices((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...updatedDevice,
                selected: d.selected,
              }
            : d,
        ),
      );
    } catch (err) {
      console.error("Failed to update device:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  const saveMovementRecord = useCallback((deviceId, latitude, longitude) => {
    try {
      const historyKey = `${MOVEMENT_HISTORY_PREFIX}${deviceId}`;
      const records = safeJsonParse(localStorage.getItem(historyKey), []);
      records.push({
        device_id: deviceId,
        latitude,
        longitude,
        timestamp: Date.now(),
      });
      localStorage.setItem(historyKey, JSON.stringify(records));
    } catch (error) {
      console.error("Failed to save movement record:", error);
    }
  }, []);

  const getMovementHistory = useCallback((deviceId) => {
    return safeJsonParse(
      localStorage.getItem(`${MOVEMENT_HISTORY_PREFIX}${deviceId}`),
      [],
    );
  }, []);

  return {
    devices,
    loading,
    error,
    addDevice,
    removeDevice,
    selectDevice,
    getSelectedDevice,
    updateDevice,
    saveMovementRecord,
    getMovementHistory,
  };
}
