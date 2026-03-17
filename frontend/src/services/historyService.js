import * as historyAPI from "../api/history";

/**
 * History Service - handles business logic for history management
 */

class HistoryService {
  /**
   * Save batch history records
   */
  async saveBatchHistory(deviceId, records) {
    try {
      const histories = await historyAPI.createBatchHistory(deviceId, records);
      return histories;
    } catch (error) {
      console.error("Error saving batch history:", error);
      throw error;
    }
  }

  /**
   * Get history by device ID and optional time range
   */
  async getHistory(deviceId, startTime, endTime) {
    try {
      const histories = await historyAPI.getHistory(
        deviceId,
        startTime,
        endTime,
      );
      return Array.isArray(histories) ? histories : [];
    } catch (error) {
      console.error("Error fetching history:", error);
      throw error;
    }
  }
}

export default new HistoryService();
