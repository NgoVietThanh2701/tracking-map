package controllers

import (
	"net/http"
	"strconv"
	"time"

	"ngovietthanh27/tracking-map/models"
	"ngovietthanh27/tracking-map/services"

	"github.com/gin-gonic/gin"
)

type HistoryController struct {
	historyService *services.HistoryService
}

func NewHistoryController(historyService *services.HistoryService) *HistoryController {
	return &HistoryController{historyService: historyService}
}

func (c *HistoryController) CreateBatchHistory(ctx *gin.Context) {
	var req models.BatchCreateHistoryRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	if len(req.Histories) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Histories array cannot be empty"})
		return
	}

	histories, err := c.historyService.CreateBatchHistory(req.DeviceID, req.Histories)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, histories)
}

func (c *HistoryController) GetHistory(ctx *gin.Context) {
	deviceIDStr := ctx.Query("device_id")
	if deviceIDStr == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "device_id is required"})
		return
	}

	deviceID, err := strconv.ParseInt(deviceIDStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid device_id"})
		return
	}

	var startTime, endTime time.Time

	// Parse start_time if provided
	startTimeStr := ctx.Query("start_time")
	if startTimeStr != "" {
		parsedStart, err := time.Parse(time.RFC3339, startTimeStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start_time format (use RFC3339)"})
			return
		}
		startTime = parsedStart
	}

	// Parse end_time if provided
	endTimeStr := ctx.Query("end_time")
	if endTimeStr != "" {
		parsedEnd, err := time.Parse(time.RFC3339, endTimeStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end_time format (use RFC3339)"})
			return
		}
		endTime = parsedEnd
	}

	histories, err := c.historyService.GetHistory(deviceID, startTime, endTime)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(histories) == 0 {
		ctx.JSON(http.StatusOK, []models.HistoryResponse{})
		return
	}

	ctx.JSON(http.StatusOK, histories)
}
