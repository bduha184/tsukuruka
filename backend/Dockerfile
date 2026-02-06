FROM golang:1.25.7-alpine

WORKDIR /app

# Git（一部パッケージで必要）
RUN apk add --no-cache git

# go.mod, go.sumをコピー
COPY go.mod go.sum ./
RUN go mod download

# ソースコードをコピー
COPY . .

EXPOSE 8080

CMD ["go", "run", "server.go"]
