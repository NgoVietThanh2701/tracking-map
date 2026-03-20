import { useState, useCallback } from "react";
import historyService from "../services/historyService";

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

  const getHistoryRoute = useCallback(async (deviceId, startTime, endTime) => {
    if (!deviceId) {
      setError("Vui lòng chọn thiết bị");
      setHistoryData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const histories = await historyService.getHistory(
        deviceId,
        startTime,
        endTime,
      );

      if (!histories || histories.length === 0) {
        setError("Không có lịch sử di chuyển trong khoảng thời gian được chọn");
        setHistoryData(null);
        return;
      }

      const records = histories
        .map((h) => ({
          device_id: h.device_id,
          latitude: Number(h.latitude),
          longitude: Number(h.longitude),
          timestamp: new Date(h.time_stamp).getTime(),
        }))
        .filter(
          (r) =>
            Number.isFinite(r.latitude) &&
            Number.isFinite(r.longitude) &&
            Number.isFinite(r.timestamp),
        );

      if (records.length === 0) {
        setError("Không có lịch sử di chuyển hợp lệ để hiển thị");
        setHistoryData(null);
        return;
      }

      const latlngs = records.map((record) => [
        record.latitude,
        record.longitude,
      ]);

      const routeData = {
        latlngs,
        records,
        distance: calculateTotalDistance(latlngs),
        duration: records[records.length - 1].timestamp - records[0].timestamp,
        recordCount: records.length,
      };

      setHistoryData(routeData);
      setError(null);
    } catch (err) {
      console.error("Failed to get movement history:", err);
      setError(err?.message || "Lỗi khi tải lịch sử di chuyển");
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
