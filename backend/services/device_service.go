package services

import (
	"fmt"

	"ngovietthanh27/tracking-map/models"
	"ngovietthanh27/tracking-map/repository"

	"github.com/google/uuid"
)

type DeviceService struct {
	deviceRepo repository.DeviceRepository
}

func NewDeviceService(deviceRepo repository.DeviceRepository) *DeviceService {
	return &DeviceService{deviceRepo: deviceRepo}
}

func (s *DeviceService) CreateDevice(req models.CreateDeviceRequest) (*models.DeviceResponse, error) {
	device := models.Device{
		UUID:      uuid.New().String(),
		Name:      req.Name,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
		Address:   req.Address,
	}

	if err := s.deviceRepo.Create(&device); err != nil {
		return nil, fmt.Errorf("failed to create device: %w", err)
	}

	return &models.DeviceResponse{
		ID:        device.ID,
		UUID:      device.UUID,
		Name:      device.Name,
		Latitude:  device.Latitude,
		Longitude: device.Longitude,
		Address:   device.Address,
		CreatedAt: device.CreatedAt,
		UpdatedAt: device.UpdatedAt,
	}, nil
}

func (s *DeviceService) DeleteDevice(id int64) error {
	if err := s.deviceRepo.DeleteByID(id); err != nil {
		return fmt.Errorf("failed to delete device: %w", err)
	}
	return nil
}

func (s *DeviceService) GetAllDevices() ([]models.Device, error) {
	devices, err := s.deviceRepo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get devices: %w", err)
	}
	return devices, nil
}

func (s *DeviceService) UpdateDeviceAddress(id int64, req models.UpdateDeviceAddressRequest) (*models.DeviceResponse, error) {
	// Get current device
	devices, err := s.deviceRepo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch device: %w", err)
	}

	var currentDevice *models.Device
	for i := range devices {
		if devices[i].ID == id {
			currentDevice = &devices[i]
			break
		}
	}

	if currentDevice == nil {
		return nil, fmt.Errorf("device not found")
	}

	// Update fields that are provided
	currentDevice.Address = req.Address
	if req.Latitude != nil {
		currentDevice.Latitude = *req.Latitude
	}
	if req.Longitude != nil {
		currentDevice.Longitude = *req.Longitude
	}

	if err := s.deviceRepo.UpdateByID(id, currentDevice); err != nil {
		return nil, fmt.Errorf("failed to update device: %w", err)
	}

	// Fetch updated device
	devices, err = s.deviceRepo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch updated device: %w", err)
	}

	for _, device := range devices {
		if device.ID == id {
			return &models.DeviceResponse{
				ID:        device.ID,
				UUID:      device.UUID,
				Name:      device.Name,
				Latitude:  device.Latitude,
				Longitude: device.Longitude,
				Address:   device.Address,
				CreatedAt: device.CreatedAt,
				UpdatedAt: device.UpdatedAt,
			}, nil
		}
	}

	return nil, fmt.Errorf("device not found after update")
}
