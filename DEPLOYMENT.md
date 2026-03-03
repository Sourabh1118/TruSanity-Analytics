# Netra Analytics - On-Premise Deployment Guide

## Overview
Netra Analytics provides an officially supported containerized deployment stack via `docker-compose.prod.yml`. This abstracts the complexity of orchestrating PostgreSQL, Redis, Apache Kafka, ClickHouse, and the Node.js application layers.

## Prerequisites
- A Linux-based enterprise server (Ubuntu 22.04 LTS recommended)
- Minimum: 8GB RAM, 4 vCPU, 100GB Fast SSD
- `docker` and `docker-compose` v2+ installed
- Domain names resolving to the server for the dashboard and API subdomains.

## Provisioning

### 1. Clone the Source
```bash
git clone https://github.com/netra-analytics/core.git netra
cd netra
```

### 2. Configure Environment Variables
Create a `.env` file at the root of the project to define the secure networking tokens and database credentials.

```bash
# .env

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure-db-password
POSTGRES_DB=netra_db

# Next Auth Secrets
AUTH_SECRET=generate-a-random-32-byte-hex-string

# External URL overrides
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 3. Boot the Cluster
The orchestrator will automatically pull the data lakes and compile the TypeScript application tiers.
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Apply Schema Migrations
Once the cluster is running, trigger the automated Drizzle ORM migrations against the fresh PostgreSQL instance:
```bash
docker-compose -f docker-compose.prod.yml exec web pnpm run db:push
```

### 5. Setup Reverse Proxy
Route traffic externally securely using Nginx or Caddy. Ensure WebSocket upgrade headers are passed to the `api` container on port `3001` for real-time dashboards to function.

```nginx
# Example snippet for Nginx
server {
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## Maintenance

### Updating Netra Analytics
```bash
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```
