import { useState, useEffect, useCallback } from "react";

const DEVICES_STORAGE_KEY = "tracking_map_devices";
const MOVEMENT_HISTORY_PREFIX = "tracking_map_movement_";

const initializeDevices = () => {
  try {
    const stored = localStorage.getItem(DEVICES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load devices:", error);
    return [];
  }
};

export function useDevices() {
  const [devices, setDevices] = useState(initializeDevices);

  // Save devices to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices));
    } catch (error) {
      console.error("Failed to save devices:", error);
    }
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
    // Also remove movement history for this device
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
      const history = localStorage.getItem(historyKey);
      const records = history ? JSON.parse(history) : [];

      const newRecord = {
        device_id: deviceId,
        latitude,
        longitude,
        timestamp: Date.now(),
      };

      records.push(newRecord);
      localStorage.setItem(historyKey, JSON.stringify(records));
    } catch (error) {
      console.error("Failed to save movement record:", error);
    }
  }, []);

  const getMovementHistory = useCallback((deviceId) => {
    try {
      const historyKey = `${MOVEMENT_HISTORY_PREFIX}${deviceId}`;
      const history = localStorage.getItem(historyKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error("Failed to get movement history:", error);
      return [];
    }
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
