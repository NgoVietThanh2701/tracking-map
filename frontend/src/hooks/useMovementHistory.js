import { useState, useCallback } from "react";

const MOVEMENT_HISTORY_PREFIX = "tracking_map_movement_";

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function getDistanceBetweenPoints(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate total distance using list of coordinates
 */
function calculateTotalDistance(latlngs) {
  if (!Array.isArray(latlngs) || latlngs.length < 2) {
    return 0;
  }

  let totalDistance = 0;
  for (let i = 0; i < latlngs.length - 1; i++) {
    const [lat1, lng1] = latlngs[i];
    const [lat2, lng2] = latlngs[i + 1];
    totalDistance += getDistanceBetweenPoints(lat1, lng1, lat2, lng2);
  }

  return totalDistance;
}

export function useMovementHistory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState(null);

  const getHistoryRoute = useCallback((deviceId, startTime, endTime) => {
    if (!deviceId) {
      setError("Vui lòng chọn thiết bị");
      setHistoryData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const historyKey = `${MOVEMENT_HISTORY_PREFIX}${deviceId}`;
      const history = localStorage.getItem(historyKey);

      if (!history) {
        setError("Không có lịch sử di chuyển cho thiết bị này");
        setHistoryData(null);
        return;
      }

      const allRecords = JSON.parse(history);
      const startTimeMs = startTime ? new Date(startTime).getTime() : 0;
      const endTimeMs = endTime ? new Date(endTime).getTime() : Date.now();

      const filteredRecords = allRecords.filter(
        (record) =>
          record.timestamp >= startTimeMs && record.timestamp <= endTimeMs,
      );

      if (filteredRecords.length === 0) {
        setError("Không có lịch sử di chuyển trong khoảng thời gian được chọn");
        setHistoryData(null);
        return;
      }

      const latlngs = filteredRecords.map((record) => [
        record.latitude,
        record.longitude,
      ]);

      const routeData = {
        latlngs,
        records: filteredRecords,
        distance: calculateTotalDistance(latlngs),
        duration:
          filteredRecords[filteredRecords.length - 1].timestamp -
          filteredRecords[0].timestamp,
        recordCount: filteredRecords.length,
      };

      setHistoryData(routeData);
      setError(null);
    } catch (err) {
      console.error("Failed to get movement history:", err);
      setError("Lỗi khi tải lịch sử di chuyển");
      setHistoryData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistoryData(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    historyData,
    getHistoryRoute,
    clearHistory,
  };
}
