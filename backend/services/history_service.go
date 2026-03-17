package services

import (
	"fmt"
	"time"

	"ngovietthanh27/tracking-map/models"
	"ngovietthanh27/tracking-map/repository"
)

type HistoryService struct {
	historyRepo repository.HistoryRepository
}

func NewHistoryService(historyRepo repository.HistoryRepository) *HistoryService {
	return &HistoryService{historyRepo: historyRepo}
}

func (s *HistoryService) CreateBatchHistory(deviceID int64, records []models.HistoryRecord) ([]models.HistoryResponse, error) {
	histories := make([]models.History, len(records))
	for i, record := range records {
		histories[i] = models.History{
			DeviceID:  deviceID,
			Latitude:  record.Latitude,
			Longitude: record.Longitude,
			TimeStamp: record.TimeStamp,
		}
	}

	if err := s.historyRepo.CreateBatch(histories); err != nil {
		return nil, fmt.Errorf("failed to create batch history: %w", err)
	}

	responses := make([]models.HistoryResponse, len(histories))
	for i, h := range histories {
		responses[i] = *toHistoryResponse(&h)
	}
	return responses, nil
}

func (s *HistoryService) GetHistory(deviceID int64, startTime, endTime time.Time) ([]models.HistoryResponse, error) {
	histories, err := s.historyRepo.GetByDeviceIDAndTimeRange(deviceID, startTime, endTime)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch history: %w", err)
	}

	return toHistoryResponses(histories), nil
}

// Helper function
func toHistoryResponse(history *models.History) *models.HistoryResponse {
	return &models.HistoryResponse{
		ID:        history.ID,
		DeviceID:  history.DeviceID,
		Latitude:  history.Latitude,
		Longitude: history.Longitude,
		TimeStamp: history.TimeStamp,
		CreatedAt: history.CreatedAt,
	}
}

func toHistoryResponses(histories []models.History) []models.HistoryResponse {
	responses := make([]models.HistoryResponse, len(histories))
	for i, h := range histories {
		responses[i] = *toHistoryResponse(&h)
	}
	return responses
}
