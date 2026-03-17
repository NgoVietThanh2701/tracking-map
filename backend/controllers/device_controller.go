package controllers

import (
	"net/http"
	"strconv"

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
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Validate latitude and longitude ranges
	if req.Latitude < -90 || req.Latitude > 90 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Latitude must be between -90 and 90"})
		return
	}

	if req.Longitude < -180 || req.Longitude > 180 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Longitude must be between -180 and 180"})
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
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Validate latitude and longitude ranges if provided
	if req.Latitude != nil && (*req.Latitude < -90 || *req.Latitude > 90) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Latitude must be between -90 and 90"})
		return
	}

	if req.Longitude != nil && (*req.Longitude < -180 || *req.Longitude > 180) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Longitude must be between -180 and 180"})
		return
	}

	device, err := c.deviceService.UpdateDeviceAddress(deviceID, req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, device)
}
