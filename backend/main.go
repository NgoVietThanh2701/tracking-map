package main

import (
	"fmt"
	"os"

	"ngovietthanh27/tracking-map/database"
	"ngovietthanh27/tracking-map/route"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	godotenv.Load()

	db := database.Connect()
	_ = db // Reserved for future use

	router := gin.Default()
	router.SetTrustedProxies(nil)
	router.Use(cors.Default())

	route.SetupRoutes(router, db)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	fmt.Printf("Server running on http://127.0.1:%s\n", port)
	router.Run("127.0.0.1:" + port)
}
