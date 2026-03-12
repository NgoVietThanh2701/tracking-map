import { useState, useEffect, useCallback } from "react";

const DEVICES_STORAGE_KEY = "tracking_map_devices";

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
      device_id: device.device_id,
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
  }, []);

  const selectDevice = useCallback((id) => {
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        selected: d.id === id,
      })),
    );
  }, []);

  const deselectDevice = useCallback(() => {
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        selected: false,
      })),
    );
  }, []);

  const getSelectedDevice = useCallback(() => {
    return devices.find((d) => d.selected) || null;
  }, [devices]);

  return {
    devices,
    addDevice,
    removeDevice,
    selectDevice,
    deselectDevice,
    getSelectedDevice,
  };
}
