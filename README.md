markdown# LogStream — Log Ingestion & Query System

A high-throughput log ingestion and query system built with Node.js, Elasticsearch, Redis, BullMQ, React, and Docker.

## Architecture
POST /logs → Redis Queue (BullMQ) → Worker (batch flush) → Elasticsearch
↑
GET  /search ──────────────────────────────────────────────────┘
GET  /logs/stream (SSE) ← real-time broadcast

### Stack
- **Backend** — Node.js + Express + TypeScript
- **Queue** — BullMQ + Redis
- **Storage** — Elasticsearch 8.x
- **Frontend** — React + Vite + TypeScript
- **Proxy** — Vite dev server proxy
- **Containers** — Docker + Docker Compose

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 20+

### Run with Docker

```bash
# Clone the repo
git clone <your-repo-url>
cd log-system

# Start all services
docker compose up --build
```

Services started:
Frontend    → http://localhost:5173
Backend API → http://localhost:3000
Elasticsearch → http://localhost:9200
Redis       → localhost:6379

### First Time Setup

1. Open http://localhost:5173
2. You'll see the bootstrap screen — create your first admin account
3. Login with your admin credentials
4. Click **USERS** in the top bar to create viewer accounts
5. Start ingesting logs!

## Log Format

```json
{
  "level": "error",
  "message": "Failed to connect to DB",
  "resourceId": "server-1234",
  "timestamp": "2023-09-15T08:00:00Z",
  "traceId": "abc-xyz-123",
  "spanId": "span-456",
  "commit": "5e5342f",
  "metadata": {
    "parentResourceId": "server-0987"
  }
}
```

Supported levels: `fatal` `error` `warn` `info` `debug` `trace`

## API Endpoints

### Auth

GET  /auth/status         — check if system is bootstrapped
POST /auth/bootstrap      — create first admin (one time only)
POST /auth/login          — login, returns JWT token
POST /auth/register       — create viewer (admin only)
GET  /auth/users          — list all users (admin only)
DELETE /auth/users/:id    — delete viewer (admin only)
GET  /auth/me             — current user info


### Ingestion (admin only)
POST /logs                — ingest single log
POST /logs/bulk           — ingest batch of logs (max 10,000)

### Query (all roles)
GET  /search              — query logs with filters
GET  /logs/stream         — SSE real-time stream
GET  /health              — system health check

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Full-text search across all fields |
| `level` | string | Filter by level (error, warn, info...) |
| `message` | string | Filter by message content |
| `resourceId` | string | Filter by resource ID |
| `traceId` | string | Filter by trace ID |
| `spanId` | string | Filter by span ID |
| `commit` | string | Filter by commit hash |
| `parentResourceId` | string | Filter by parent resource ID |
| `timestampFrom` | ISO date | Start of date range |
| `timestampTo` | ISO date | End of date range |
| `regex` | boolean | Use regex on message field |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 50) |

## Sample Queries

```bash
# Get auth token first
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Find all error logs
curl "http://localhost:3000/search?level=error" \
  -H "Authorization: Bearer $TOKEN"

# Full-text search
curl "http://localhost:3000/search?q=Failed+to+connect" \
  -H "Authorization: Bearer $TOKEN"

# Filter by resourceId
curl "http://localhost:3000/search?resourceId=server-1234" \
  -H "Authorization: Bearer $TOKEN"

# Date range filter
curl "http://localhost:3000/search?timestampFrom=2023-09-01T00:00:00Z&timestampTo=2023-09-15T23:59:59Z" \
  -H "Authorization: Bearer $TOKEN"

# Regex search
curl "http://localhost:3000/search?regex=true&q=Failed.*DB" \
  -H "Authorization: Bearer $TOKEN"

# Combined filters
curl "http://localhost:3000/search?level=error&resourceId=server-1234" \
  -H "Authorization: Bearer $TOKEN"

# Ingest single log
curl -X POST http://localhost:3000/logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"level":"error","message":"Failed to connect to DB","resourceId":"server-1234","timestamp":"2023-09-15T08:00:00Z","traceId":"abc-xyz-123","spanId":"span-456","commit":"5e5342f","metadata":{"parentResourceId":"server-0987"}}'

# Ingest bulk logs
curl -X POST http://localhost:3000/logs/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '[{"level":"info","message":"Server started","resourceId":"server-1234","timestamp":"2023-09-15T08:01:00Z","traceId":"abc-xyz-124","spanId":"span-457","commit":"5e5342f","metadata":{"parentResourceId":"server-0987"}}]'
```

## Seed Test Data

```bash
# Generate and ingest 1000 random logs
node seed.js
```

## Role-Based Access Control

Two roles available — **Admin** and **Viewer**.

| Action | Admin | Viewer |
|--------|-------|--------|
| Ingest logs | ✅ | ❌ |
| Search logs | ✅ | ✅ |
| Real-time stream | ✅ | ✅ |
| Create viewers | ✅ | ❌ |
| Delete viewers | ✅ | ❌ |
| View user list | ✅ | ❌ |

### How to create users

1. Bootstrap creates the first **admin** account
2. Admin logs in → clicks **USERS** button in top bar
3. Admin fills username + password → clicks **CREATE VIEWER**
4. Viewer can now login and search logs

> Note: Admin accounts can only be created via bootstrap.
> Admins can only create viewer accounts from the UI.

## Features

### Core
- High-throughput HTTP ingestion on port 3000
- Async processing via Redis queue (BullMQ)
- Batch indexing — flushes every 500 logs or 1 second
- Full-text search powered by Elasticsearch
- Filter by all log fields
- Paginated results

### Bonus
- Date range filtering
- Regex search on message field
- Multiple combined filters
- Real-time log streaming via SSE
- Role-based access control (Admin / Viewer)
- Bootstrap flow — first admin created on first launch
- User management UI — admin creates/deletes viewers

## Performance (k6 Stress Test)

Tested with 200 concurrent users over 5 minutes:
✅ 100% success rate (0 failures)
✅ p95 response time: 50ms (threshold: 500ms)
✅ Average response time: 18ms
✅ 80 requests/second sustained
✅ 28,560 total requests processed

## Project Structure
log-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── elasticsearch.ts
│   │   │   ├── redis.ts
│   │   │   ├── logger.ts
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.types.ts
│   │   │   ├── logs/
│   │   │   │   ├── log.controller.ts
│   │   │   │   ├── log.queue.ts
│   │   │   │   ├── log.routes.ts
│   │   │   │   ├── log.service.ts
│   │   │   │   └── log.types.ts
│   │   │   ├── search/
│   │   │   │   ├── search.controller.ts
│   │   │   │   ├── search.routes.ts
│   │   │   │   ├── search.service.ts
│   │   │   │   └── search.types.ts
│   │   │   └── stream/
│   │   │       └── stream.service.ts
│   │   ├── worker/
│   │   │   └── logWorker.ts
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── LogTable.tsx
│   │   │   ├── LogRow.tsx
│   │   │   ├── DetailPanel.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── LevelBadge.tsx
│   │   ├── hooks/
│   │   │   ├── useSearch.ts
│   │   │   └── useRealtime.ts
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── UsersPage.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── App.tsx
│   ├── Dockerfile
│   └── vite.config.ts
├── k6/
│   └── stress-test.js
├── seed.js
├── docker-compose.yml
└── README.md

## Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `ELASTIC_URL` | `http://localhost:9200` | Elasticsearch URL |
| `ELASTIC_INDEX` | `logs` | Index name |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `QUEUE_NAME` | `logQueue` | BullMQ queue name |
| `BATCH_SIZE` | `500` | Logs per batch flush |
| `FLUSH_INTERVAL` | `1000` | Flush interval in ms |
| `JWT_SECRET` | `super-secret` | JWT signing secret |
| `JWT_EXPIRES` | `24h` | JWT expiry |

## Docker Compose Services

| Service | Image | Port |
|---------|-------|------|
| backend | custom | 3000 |
| worker | custom | — |
| frontend | custom | 5173 |
| elasticsearch | 8.13.4 | 9200 |
| redis | 7-alpine | 6379 |