import { useState, useEffect, useCallback } from "react";

const DEVICES_STORAGE_KEY = "tracking_map_devices";
const MOVEMENT_HISTORY_PREFIX = "tracking_map_movement_";

// Helper functions to reduce localStorage boilerplate
const safeJsonParse = (json, fallback = null) => {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return fallback;
  }
};

const safeJsonStringify = (value) => {
  try {
    localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save devices:", error);
  }
};

const initializeDevices = () =>
  safeJsonParse(localStorage.getItem(DEVICES_STORAGE_KEY), []);

export function useDevices() {
  const [devices, setDevices] = useState(initializeDevices);

  // Save devices to localStorage whenever they change
  useEffect(() => {
    safeJsonStringify(devices);
  }, [devices]);

  const addDevice = useCallback((device) => {
    const newDevice = {
      id: Date.now().toString(),
      name: device.name,
      latitude: device.latitude,
      longitude: device.longitude,
      address: device.address,
      timestamp: Date.now(),
      selected: false,
    };
    setDevices((prev) => [newDevice, ...prev]);
    return newDevice;
  }, []);

  const removeDevice = useCallback((id) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    try {
      localStorage.removeItem(`${MOVEMENT_HISTORY_PREFIX}${id}`);
    } catch (error) {
      console.error("Failed to remove movement history:", error);
    }
  }, []);

  const selectDevice = useCallback((id) => {
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        selected: d.id === id,
      })),
    );
  }, []);

  const getSelectedDevice = useCallback(() => {
    return devices.find((d) => d.selected) || null;
  }, [devices]);

  const updateDevice = useCallback((id, updates) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              ...updates,
              timestamp: Date.now(),
            }
          : d,
      ),
    );
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
    addDevice,
    removeDevice,
    selectDevice,
    getSelectedDevice,
    updateDevice,
    saveMovementRecord,
    getMovementHistory,
  };
}
