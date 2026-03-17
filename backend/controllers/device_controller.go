package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	"ngovietthanh27/tracking-map/config"
	"ngovietthanh27/tracking-map/models"
	"ngovietthanh27/tracking-map/services"

	"github.com/gin-gonic/gin"
)

type DeviceController struct {
	deviceService *services.DeviceService
}

func NewDeviceController(deviceService *services.DeviceService) *DeviceController {
	return &DeviceController{deviceService: deviceService}
}

func (c *DeviceController) CreateDevice(ctx *gin.Context) {
	var req models.CreateDeviceRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": config.ErrInvalidRequest + ": " + err.Error()})
		return
	}

	// Validate latitude and longitude ranges
	if err := validateCoordinates(req.Latitude, req.Longitude); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	device, err := c.deviceService.CreateDevice(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, device)
}

func (c *DeviceController) DeleteDevice(ctx *gin.Context) {
	id := ctx.Param("id")
	deviceID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid device ID"})
		return
	}

	if err := c.deviceService.DeleteDevice(deviceID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Device deleted successfully"})
}

func (c *DeviceController) GetAllDevices(ctx *gin.Context) {
	devices, err := c.deviceService.GetAllDevices()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, devices)
}

func (c *DeviceController) UpdateDeviceAddress(ctx *gin.Context) {
	id := ctx.Param("id")
	deviceID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid device ID"})
		return
	}

	var req models.UpdateDeviceAddressRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": config.ErrInvalidRequest + ": " + err.Error()})
		return
	}

	// Validate latitude and longitude ranges if provided
	if err := validateOptionalCoordinates(req.Latitude, req.Longitude); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	device, err := c.deviceService.UpdateDeviceAddress(deviceID, req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, device)
}

// Helper functions

func validateCoordinates(lat, lng float64) error {
	if lat < config.MinLatitude || lat > config.MaxLatitude {
		return fmt.Errorf(config.ErrInvalidLatitude)
	}
	if lng < config.MinLongitude || lng > config.MaxLongitude {
		return fmt.Errorf(config.ErrInvalidLongitude)
	}
	return nil
}

func validateOptionalCoordinates(lat, lng *float64) error {
	if lat != nil && (*lat < config.MinLatitude || *lat > config.MaxLatitude) {
		return fmt.Errorf(config.ErrInvalidLatitude)
	}
	if lng != nil && (*lng < config.MinLongitude || *lng > config.MaxLongitude) {
		return fmt.Errorf(config.ErrInvalidLongitude)
	}
	return nil
}
