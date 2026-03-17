package models

import "time"

type History struct {
	ID        int64     `json:"id" gorm:"primaryKey"`
	DeviceID  int64     `json:"device_id" gorm:"index"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	TimeStamp time.Time `json:"time_stamp" gorm:"index"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}

func (History) TableName() string {
	return "histories_devices"
}

type BatchCreateHistoryRequest struct {
	DeviceID  int64           `json:"device_id" binding:"required"`
	Histories []HistoryRecord `json:"histories" binding:"required"`
}

type HistoryRecord struct {
	Latitude  float64   `json:"latitude" binding:"required"`
	Longitude float64   `json:"longitude" binding:"required"`
	TimeStamp time.Time `json:"time_stamp" binding:"required"`
}

type HistoryResponse struct {
	ID        int64     `json:"id"`
	DeviceID  int64     `json:"device_id"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	TimeStamp time.Time `json:"time_stamp"`
	CreatedAt time.Time `json:"created_at"`
}
