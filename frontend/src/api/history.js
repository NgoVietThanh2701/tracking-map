import axiosInstance from "./axios";
import { handleApiError } from "../utils/apiErrorHandler";

/**
 * History API endpoints
 */

// Create batch history records
export const createBatchHistory = async (deviceId, histories) => {
  try {
    const response = await axiosInstance.post("/histories", {
      device_id: deviceId,
      histories,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Failed to create history");
  }
};

// Get history by device_id and optional time range
export const getHistory = async (deviceId, startTime, endTime) => {
  try {
    const response = await axiosInstance.get("/histories", {
      params: {
        device_id: deviceId,
        start_time: startTime ? new Date(startTime).toISOString() : undefined,
        end_time: endTime ? new Date(endTime).toISOString() : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch history");
  }
};
