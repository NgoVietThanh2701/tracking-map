package services

import (
	"fmt"

	"ngovietthanh27/tracking-map/config"
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

// toDeviceResponse converts a Device model to DeviceResponse
func toDeviceResponse(device *models.Device) *models.DeviceResponse {
	return &models.DeviceResponse{
		ID:        device.ID,
		UUID:      device.UUID,
		Name:      device.Name,
		Latitude:  device.Latitude,
		Longitude: device.Longitude,
		Address:   device.Address,
		CreatedAt: device.CreatedAt,
		UpdatedAt: device.UpdatedAt,
	}
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
		return nil, fmt.Errorf("%s: %w", config.ErrFailedToCreate, err)
	}

	return toDeviceResponse(&device), nil
}

func (s *DeviceService) DeleteDevice(id int64) error {
	if err := s.deviceRepo.DeleteByID(id); err != nil {
		return fmt.Errorf("%s: %w", config.ErrFailedToDelete, err)
	}
	return nil
}

func (s *DeviceService) GetAllDevices() ([]models.Device, error) {
	devices, err := s.deviceRepo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("%s: %w", config.ErrFailedToFetch, err)
	}
	return devices, nil
}

func (s *DeviceService) UpdateDeviceAddress(id int64, req models.UpdateDeviceAddressRequest) (*models.DeviceResponse, error) {
	// Get current device by ID (efficient query)
	device, err := s.deviceRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", config.ErrFailedToFetch, err)
	}

	if device == nil {
		return nil, fmt.Errorf(config.ErrDeviceNotFound)
	}

	// Update fields that are provided
	device.Address = req.Address
	if req.Latitude != nil {
		device.Latitude = *req.Latitude
	}
	if req.Longitude != nil {
		device.Longitude = *req.Longitude
	}

	if err := s.deviceRepo.UpdateByID(id, device); err != nil {
		return nil, fmt.Errorf("%s: %w", config.ErrFailedToUpdate, err)
	}

	return toDeviceResponse(device), nil
}
