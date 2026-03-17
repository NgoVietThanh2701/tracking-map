package repository

import (
	"ngovietthanh27/tracking-map/models"
	"time"

	"gorm.io/gorm"
)

type HistoryRepository interface {
	CreateBatch(histories []models.History) error
	GetByDeviceIDAndTimeRange(deviceID int64, startTime, endTime time.Time) ([]models.History, error)
}

type historyRepository struct {
	db *gorm.DB
}

func NewHistoryRepository(db *gorm.DB) HistoryRepository {
	return &historyRepository{db: db}
}

func (r *historyRepository) CreateBatch(histories []models.History) error {
	return r.db.CreateInBatches(histories, 100).Error
}

func (r *historyRepository) GetByDeviceIDAndTimeRange(deviceID int64, startTime, endTime time.Time) ([]models.History, error) {
	var histories []models.History
	query := r.db.Where("device_id = ?", deviceID)

	if !startTime.IsZero() {
		query = query.Where("time_stamp >= ?", startTime)
	}

	if !endTime.IsZero() {
		query = query.Where("time_stamp <= ?", endTime)
	}

	if err := query.Order("time_stamp ASC").Find(&histories).Error; err != nil {
		return nil, err
	}
	return histories, nil
}
