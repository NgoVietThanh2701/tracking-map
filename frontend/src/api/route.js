import axiosInstance from "./axios";

/**
 * Get route between two points
 * @param {Object} params - {from: {lat, lng}, to: {lat, lng}}
 * @returns {Promise<{distance, duration, latlngs}>}
 */
export const getRoute = async (params) => {
  try {
    const response = await axiosInstance.post("/route", {
      from: params.from,
      to: params.to,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

export default {
  getRoute,
};
