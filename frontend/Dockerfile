FROM node:22-alpine

WORKDIR /app

# package.jsonをコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

EXPOSE 3000

# 開発サーバー起動
CMD ["npm", "run", "dev"]
