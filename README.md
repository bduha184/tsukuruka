# 🍳 つくりおき

料理動画を見て「作りたい！」と思ったけど、結局作れていない…
そんな経験を解決する、作りたい料理を「思い出させる」アプリ。

## 🛠 Tech Stack

| Layer             | Technology                        |
| ----------------- | --------------------------------- |
| Backend           | Go + GraphQL                      |
| Database          | Supabase (PostgreSQL)             |
| Auth              | Supabase Auth (Google/Apple/LINE) |
| Frontend Web      | Next.js 14 (App Router)           |
| Frontend Mobile   | Expo (React Native) - 予定        |
| Push Notification | FCM - 予定                        |

## 📁 Project Structure

```
tsukuruka/
├── docker-compose.yml    # Container orchestration
├── backend/              # Go GraphQL server
│   ├── Dockerfile
│   ├── go.mod
│   └── main.go
├── frontend/             # Next.js web app
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── supabase/             # Database migrations
    └── migrations/
```

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Supabase account (https://supabase.com)

### 1. Clone & Setup

```bash
# Clone repository
git clone https://github.com/tsukuruka/tsukuruka.git
cd tsukuruka

# Copy environment variables
cp .env.example .env
```

### 2. Configure Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Settings > API and copy:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
3. Update `.env` with your values

### 3. Run Database Migration

Go to Supabase Dashboard > SQL Editor and run:

```sql
-- Copy contents from supabase/migrations/001_initial.sql
```

### 4. Start Development

```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 5. Access

- **Frontend**: http://localhost:3000
- **Backend GraphQL**: http://localhost:8080/graphql
- **GraphiQL Playground**: http://localhost:8080/graphql

## 📊 GraphQL API

### Queries

```graphql
# Health check
query {
  health {
    status
    timestamp
    version
  }
}

# Get recipes (dummy data for now)
query {
  recipes {
    id
    title
    url
    status
  }
}
```

### Mutations

```graphql
# Ping test
mutation {
  ping
}
```

## 🧪 Verification

1. Open http://localhost:3000
2. Check all status badges show "✓ 接続OK"
3. Click "ping → pong" button to test mutation

## 📝 Development

### Backend

```bash
# Enter backend container
docker-compose exec backend sh

# Run locally (outside Docker)
cd backend
go run main.go
```

### Frontend

```bash
# Enter frontend container
docker-compose exec frontend sh

# Run locally (outside Docker)
cd frontend
npm install
npm run dev
```

## 🔧 Troubleshooting

### Port already in use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :8080

# Kill the process or change ports in docker-compose.yml
```

### Container logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📄 License

MIT
