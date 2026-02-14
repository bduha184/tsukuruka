FROM golang:1.24-alpine

WORKDIR /app

# 必要なパッケージをインストール
RUN apk add --no-cache git ca-certificates

# 依存関係をダウンロード
COPY go.mod go.sum ./
RUN go mod download

# ソースコードをコピー
COPY . .

# ビルド
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

EXPOSE 8080

CMD ["./app"]
