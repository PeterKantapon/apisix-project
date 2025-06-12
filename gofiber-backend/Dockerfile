# gofiber-backend/Dockerfile (Simple Version)
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy everything
COPY . .

# Initialize go module and download dependencies
RUN go mod init gofiber-backend || true
RUN go get github.com/gofiber/fiber/v2@latest
RUN go get github.com/gofiber/fiber/v2/middleware/cors
RUN go get github.com/gofiber/fiber/v2/middleware/logger
RUN go get gorm.io/driver/mysql@latest
RUN go get gorm.io/gorm@latest

# Build
RUN go build -o main .

# Final stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates curl
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]