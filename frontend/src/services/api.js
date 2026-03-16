import { BACKEND_API } from "../constants";

const BASE_URL = BACKEND_API.BASE_URL;

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Get route between two points
 * @param {Object} params - {from: {lat, lng}, to: {lat, lng}}
 * @returns {Promise<{distance, duration, latlngs}>}
 */
export async function getRoute(params) {
  return request(`${BACKEND_API.ROUTE_ENDPOINT}`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// Export for future API extensions
export default {
  getRoute,
};
