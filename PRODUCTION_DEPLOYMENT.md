# Production Deployment Guide

## Quick Deployment Commands

### Method 1: Manual SSH Deployment (Recommended)

```bash
# 1. SSH into your production server
ssh user@your-production-server.com

# 2. Navigate to project directory
cd /path/to/TruSanity_Analytics

# 3. Pull latest changes
git pull origin main

# 4. Stop existing services
docker compose -f infra/docker-compose.yml down

# 5. Rebuild with latest code (no cache to ensure fresh build)
docker compose -f infra/docker-compose.yml build --no-cache

# 6. Start all services
docker compose -f infra/docker-compose.yml up -d

# 7. Verify services are running
docker compose -f infra/docker-compose.yml ps

# 8. Check logs for any errors
docker compose -f infra/docker-compose.yml logs -f api
docker compose -f infra/docker-compose.yml logs -f consumer
```

### Method 2: Using Deployment Script

```bash
# 1. Update the PROJECT_DIR path in deploy-production.sh
nano deploy-production.sh

# 2. Copy script to production server
scp deploy-production.sh user@your-production-server.com:/path/to/TruSanity_Analytics/

# 3. SSH and run the script
ssh user@your-production-server.com
cd /path/to/TruSanity_Analytics
./deploy-production.sh
```

### Method 3: One-Liner Remote Deployment

```bash
ssh user@your-production-server.com "cd /path/to/TruSanity_Analytics && git pull origin main && docker compose -f infra/docker-compose.yml down && docker compose -f infra/docker-compose.yml build --no-cache && docker compose -f infra/docker-compose.yml up -d"
```

## Pre-Deployment Checklist

- [ ] Backup production database
- [ ] Ensure `.env` file is configured on production server
- [ ] Verify Docker and Docker Compose are installed
- [ ] Check available disk space (minimum 20GB free)
- [ ] Notify team about deployment window
- [ ] Have rollback plan ready

## Post-Deployment Verification

### 1. Check Service Health

```bash
# View all running services
docker compose -f infra/docker-compose.yml ps

# Expected output: All services should show "Up" status
```

### 2. Test API Endpoint

```bash
# Health check
curl http://localhost:3001/health

# Expected: {"status":"ok","timestamp":"..."}
```

### 3. Test Event Ingestion

```bash
# Send test event
curl -X POST http://localhost:3001/v1/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "projectId": "YOUR_PROJECT_ID",
    "events": [{
      "name": "test_event",
      "session_id": "test_123",
      "anonymous_id": "test_user",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }]
  }'

# Expected: {"success":true,"ingested":1}
```

### 4. Verify Dashboard

```bash
# Open in browser
http://your-domain.com/dashboard

# Check:
# - KPI cards show data
# - Charts render correctly
# - Recent events table populated
```

### 5. Check Consumer Logs

```bash
docker compose -f infra/docker-compose.yml logs consumer --tail=100

# Look for: "✅ Inserted X events into ClickHouse"
```

### 6. Verify ClickHouse Data

```bash
# Connect to ClickHouse
docker exec -it netra_clickhouse clickhouse-client

# Run query
SELECT COUNT(*) FROM netra.events;
SELECT * FROM netra.events ORDER BY timestamp DESC LIMIT 5;
```

## Rollback Procedure

If deployment fails:

```bash
# 1. Stop current services
docker compose -f infra/docker-compose.yml down

# 2. Checkout previous version
git log --oneline -10  # Find previous commit hash
git checkout <previous-commit-hash>

# 3. Rebuild and restart
docker compose -f infra/docker-compose.yml build --no-cache
docker compose -f infra/docker-compose.yml up -d

# 4. Verify services
docker compose -f infra/docker-compose.yml ps
```

## Monitoring Commands

```bash
# View all logs
docker compose -f infra/docker-compose.yml logs -f

# View specific service logs
docker compose -f infra/docker-compose.yml logs -f api
docker compose -f infra/docker-compose.yml logs -f consumer
docker compose -f infra/docker-compose.yml logs -f clickhouse

# Check resource usage
docker stats

# Check disk usage
docker system df
```

## Troubleshooting

### Services Won't Start

```bash
# Check Docker daemon
sudo systemctl status docker

# Check logs for specific service
docker compose -f infra/docker-compose.yml logs <service-name>

# Restart specific service
docker compose -f infra/docker-compose.yml restart <service-name>
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
docker exec -it netra_postgres psql -U netra -d netra_db -c "SELECT 1;"

# Test ClickHouse connection
docker exec -it netra_clickhouse clickhouse-client --query "SELECT 1"
```

### Kafka Issues

```bash
# Check Kafka topics
docker exec -it netra_kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list

# Check consumer groups
docker exec -it netra_kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
```

### Port Conflicts

```bash
# Check if ports are already in use
sudo netstat -tulpn | grep -E ':(3001|5433|6379|9092|8123)'

# Stop conflicting services or change ports in docker-compose.yml
```

## Environment Variables

Ensure these are set in your production `.env` file:

```bash
# Database
POSTGRES_USER=netra
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=netra_db
DATABASE_URL=postgresql://netra:<password>@postgres:5432/netra_db

# Redis
REDIS_URL=redis://redis:6379

# Kafka
KAFKA_BROKERS=kafka:9092

# ClickHouse
CLICKHOUSE_URL=http://clickhouse:8123

# API
PORT=3001
NODE_ENV=production

# NextAuth (for web dashboard)
AUTH_SECRET=<generate-random-secret>
NEXTAUTH_URL=https://your-domain.com
```

## Security Recommendations

1. **Change default passwords** in docker-compose.yml
2. **Use environment variables** for sensitive data
3. **Enable SSL/TLS** for production domains
4. **Set up firewall rules** to restrict access
5. **Regular backups** of PostgreSQL and ClickHouse data
6. **Monitor logs** for suspicious activity
7. **Keep Docker images updated** regularly

## Backup Commands

```bash
# Backup PostgreSQL
docker exec netra_postgres pg_dump -U netra netra_db > backup_$(date +%Y%m%d).sql

# Backup ClickHouse
docker exec netra_clickhouse clickhouse-client --query "BACKUP DATABASE netra TO Disk('backups', 'backup_$(date +%Y%m%d)')"

# Backup volumes
docker run --rm -v netra_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz /data
```

## Support

For issues or questions:
- Check logs: `docker compose -f infra/docker-compose.yml logs -f`
- Review FIXES_APPLIED.md for recent changes
- Contact: support@trusanity.com
