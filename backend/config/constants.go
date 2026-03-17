package config

const (
	// OSRM Configuration
	OSRMBaseURL = "http://router.project-osrm.org"
	OSRMProfile = "driving"
	OSRMVersion = "v1"

	// Validation Constraints
	MinLatitude  = -90.0
	MaxLatitude  = 90.0
	MinLongitude = -180.0
	MaxLongitude = 180.0

	// Error Messages
	ErrInvalidLatitude  = "Latitude must be between -90 and 90"
	ErrInvalidLongitude = "Longitude must be between -180 and 180"
	ErrInvalidRequest   = "Invalid request"
	ErrDeviceNotFound   = "Device not found"
	ErrFailedToCreate   = "Failed to create device"
	ErrFailedToDelete   = "Failed to delete device"
	ErrFailedToFetch    = "Failed to fetch devices"
	ErrFailedToUpdate   = "Failed to update device"
)
