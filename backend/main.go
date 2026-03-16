package main

import (
	"fmt"
	"log"
	"os"

	"ngovietthanh27/tracking-map/handlers"
	"ngovietthanh27/tracking-map/middleware"
	"ngovietthanh27/tracking-map/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	godotenv.Load()
	dsn := os.Getenv("DB_CONNECT_STR")
	if dsn == "" {
		log.Fatal("DB_CONNECT_STR is not set")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	_ = db
	if err != nil {
		log.Fatalln(err)
	}

	fmt.Println("Connect database successfully!")

	// Initialize services
	routeService := services.NewRouteService()

	// Initialize handlers
	routeHandler := handlers.NewRouteHandler(routeService)

	router := gin.Default()
	router.SetTrustedProxies(nil)

	// Configure CORS
	router.Use(cors.Default())

	// Configure middleware
	router.Use(middleware.ErrorHandler())

	// API Routes
	api := router.Group("/api")
	{
		// Route endpoints
		api.POST("/route", routeHandler.GetRoute)
	}

	router.Run("127.0.0.1:5000")
}
