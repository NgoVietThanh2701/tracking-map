package repository

import (
	"ngovietthanh27/tracking-map/models"

	"gorm.io/gorm"
)

type DeviceRepository interface {
	Create(device *models.Device) error
	DeleteByID(id int64) error
	GetAll() ([]models.Device, error)
	GetByID(id int64) (*models.Device, error)
	UpdateByID(id int64, device *models.Device) error
}

type deviceRepository struct {
	db *gorm.DB
}

func NewDeviceRepository(db *gorm.DB) DeviceRepository {
	return &deviceRepository{db: db}
}

func (r *deviceRepository) Create(device *models.Device) error {
	return r.db.Create(device).Error
}

func (r *deviceRepository) DeleteByID(id int64) error {
	return r.db.Delete(&models.Device{}, id).Error
}

func (r *deviceRepository) GetAll() ([]models.Device, error) {
	var devices []models.Device
	if err := r.db.Find(&devices).Error; err != nil {
		return nil, err
	}
	return devices, nil
}

func (r *deviceRepository) GetByID(id int64) (*models.Device, error) {
	var device models.Device
	if err := r.db.First(&device, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &device, nil
}

func (r *deviceRepository) UpdateByID(id int64, device *models.Device) error {
	return r.db.Model(&models.Device{}).Where("id = ?", id).Updates(device).Error
}
