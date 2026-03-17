package models

import "time"

type Device struct {
	ID        int64     `json:"id" gorm:"primaryKey"`
	UUID      string    `json:"uuid" gorm:"uniqueIndex"`
	Name      string    `json:"name"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	Address   string    `json:"address"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type CreateDeviceRequest struct {
	Name      string  `json:"name" binding:"required,min=1,max=255"`
	Latitude  float64 `json:"latitude" binding:"required"`
	Longitude float64 `json:"longitude" binding:"required"`
	Address   string  `json:"address" binding:"required,min=1,max=500"`
}

type UpdateDeviceAddressRequest struct {
	Address   string   `json:"address" binding:"required,min=1,max=500"`
	Latitude  *float64 `json:"latitude" binding:"omitempty"`
	Longitude *float64 `json:"longitude" binding:"omitempty"`
}

type DeviceResponse struct {
	ID        int64     `json:"id"`
	UUID      string    `json:"uuid"`
	Name      string    `json:"name"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	Address   string    `json:"address"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
