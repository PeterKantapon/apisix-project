// gofiber-backend/main.go
package main

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type Record struct {
	ID    uint   `json:"id" gorm:"primaryKey;autoIncrement"`
	Name  string `json:"name" gorm:"not null"`
	Value string `json:"value"`
	CreatedAt time.Time `json:"created_at"`
}

type Database struct {
	DB *gorm.DB
}

func main() {
	// Initialize database
	db, err := initDatabase()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	database := &Database{DB: db}

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "healthy",
			"timestamp": time.Now(),
		})
	})

	// API routes
	api := app.Group("/api")
	
	// GET /data - Retrieve all records
	api.Get("/data", database.getData)
	
	// POST /data - Create new record
	api.Post("/data", database.createData)
	
	// GET /data/:id - Get specific record
	api.Get("/data/:id", database.getDataByID)
	
	// PUT /data/:id - Update record
	api.Put("/data/:id", database.updateData)
	
	// DELETE /data/:id - Delete record
	api.Delete("/data/:id", database.deleteData)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func initDatabase() (*gorm.DB, error) {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	if host == "" {
		host = "localhost"
	}
	if port == "" {
		port = "3306"
	}

	dsn := user + ":" + password + "@tcp(" + host + ":" + port + ")/" + dbname + "?charset=utf8mb4&parseTime=True&loc=Local"
	
	// Retry connection with exponential backoff
	var db *gorm.DB
	var err error
	
	for i := 0; i < 10; i++ {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			break
		}
		log.Printf("Database connection attempt %d failed: %v", i+1, err)
		time.Sleep(time.Duration(i+1) * time.Second)
	}

	if err != nil {
		return nil, err
	}

	// Auto migrate
	if err := db.AutoMigrate(&Record{}); err != nil {
		return nil, err
	}

	log.Println("Database connected and migrated successfully")
	return db, nil
}

func (d *Database) getData(c *fiber.Ctx) error {
	var records []Record
	
	if err := d.DB.Find(&records).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch records",
		})
	}

	return c.JSON(fiber.Map{
		"data": records,
		"count": len(records),
	})
}

func (d *Database) createData(c *fiber.Ctx) error {
	var record Record
	
	if err := c.BodyParser(&record); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if record.Name == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Name is required",
		})
	}

	record.CreatedAt = time.Now()
	
	if err := d.DB.Create(&record).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to create record",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Record created successfully",
		"data": record,
	})
}

func (d *Database) getDataByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var record Record
	if err := d.DB.First(&record, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Record not found",
		})
	}

	return c.JSON(fiber.Map{
		"data": record,
	})
}

func (d *Database) updateData(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	var record Record
	if err := d.DB.First(&record, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Record not found",
		})
	}

	var updateData Record
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if updateData.Name != "" {
		record.Name = updateData.Name
	}
	if updateData.Value != "" {
		record.Value = updateData.Value
	}

	if err := d.DB.Save(&record).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update record",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Record updated successfully",
		"data": record,
	})
}

func (d *Database) deleteData(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid ID format",
		})
	}

	if err := d.DB.Delete(&Record{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete record",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Record deleted successfully",
	})
}