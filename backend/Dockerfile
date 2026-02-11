# ==========ビルド==========
FROM golang:1.23-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app .

# ==========開発==========
FROM golang:1.23-alpine AS dev
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
EXPOSE 8080
CMD ["go", "run", "."]

# ==========本番==========
FROM debian:bullseye-slim AS prod
WORKDIR /app
COPY --from=builder /app/app .
EXPOSE 8080
CMD ["./app"]
