# ==========ビルド==========
FROM golang:1.24-alpine AS builder
WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app .

# ==========開発==========
FROM golang:1.24-alpine AS dev
WORKDIR /app

# Chromium と必要なライブラリをインストール
RUN apk add --no-cache \
    git \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-cjk

# Chromium のパスを環境変数に設定
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

COPY go.mod go.sum ./
RUN go mod download
COPY . .

EXPOSE 8080
CMD ["go", "run", "."]

# ==========本番==========
FROM debian:bullseye-slim AS prod
WORKDIR /app

# Chromium と必要なライブラリをインストール（本番用）
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-cjk \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Chromium のパスを環境変数に設定
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROME_PATH=/usr/lib/chromium/

COPY --from=builder /app/app .

EXPOSE 8080
CMD ["./app"]
