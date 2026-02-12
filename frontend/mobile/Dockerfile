# ==========開発==========
FROM node:22-alpine AS dev
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 19000 19001 19002
CMD ["npm", "run", "start"]

# ==========本番==========
FROM node:20-alpine AS prod
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .
RUN npm run build

CMD ["npm", "run", "start"]
