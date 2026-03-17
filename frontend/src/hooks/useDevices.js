import { useState, useEffect, useCallback } from "react";
import deviceService from "../services/deviceService";
import { STORAGE_KEYS, ERROR_MESSAGES } from "../constants";

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
        const savedSelectedId = localStorage.getItem(
          STORAGE_KEYS.SELECTED_DEVICE_ID,
        );

        // Mark device as selected if it exists in the new data
        const devicesWithSelection = data.map((d) => ({
          ...d,
          selected: savedSelectedId
            ? d.id === parseInt(savedSelectedId, 10)
            : false,
        }));

        setDevices(devicesWithSelection);
      } catch (err) {
        console.error(ERROR_MESSAGES.FETCH_DEVICES, err);
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

      // If removed device was selected, clear from localStorage
      const selectedId = localStorage.getItem(STORAGE_KEYS.SELECTED_DEVICE_ID);
      if (selectedId && parseInt(selectedId, 10) === id) {
        localStorage.removeItem(STORAGE_KEYS.SELECTED_DEVICE_ID);
      }
    } catch (err) {
      console.error(ERROR_MESSAGES.REMOVE_DEVICE, err);
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
    localStorage.setItem(STORAGE_KEYS.SELECTED_DEVICE_ID, String(id));
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

  return {
    devices,
    loading,
    error,
    addDevice,
    removeDevice,
    selectDevice,
    getSelectedDevice,
    updateDevice,
  };
}
