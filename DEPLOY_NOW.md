# 🚀 Production Deployment Commands

## ✅ Build Status: SUCCESS
All TypeScript errors have been fixed and the build completes successfully.

---

## 📋 Quick Deployment (Choose One Method)

### Method 1: One-Line Remote Deployment (Fastest)

```bash
ssh user@your-production-server.com "cd /path/to/TruSanity_Analytics && git pull origin main && docker compose -f infra/docker-compose.yml down && docker compose -f infra/docker-compose.yml build --no-cache && docker compose -f infra/docker-compose.yml up -d && docker compose -f infra/docker-compose.yml ps"
```

**Replace:**
- `user@your-production-server.com` with your actual SSH credentials
- `/path/to/TruSanity_Analytics` with your actual project path

---

### Method 2: Step-by-Step SSH Deployment (Recommended for First Time)

```bash
# 1. SSH into production server
ssh user@your-production-server.com

# 2. Navigate to project directory
cd /path/to/TruSanity_Analytics

# 3. Pull latest code
git pull origin main

# 4. Stop existing services
docker compose -f infra/docker-compose.yml down

# 5. Rebuild with latest code (no cache ensures fresh build)
docker compose -f infra/docker-compose.yml build --no-cache

# 6. Start all services in detached mode
docker compose -f infra/docker-compose.yml up -d

# 7. Verify all services are running
docker compose -f infra/docker-compose.yml ps

# 8. Check logs for any errors
docker compose -f infra/docker-compose.yml logs -f api
```

---

### Method 3: Using the Deployment Script

```bash
# 1. Make the script executable (if not already)
chmod +x deploy-production.sh

# 2. Copy to production server
scp deploy-production.sh user@your-production-server.com:/path/to/TruSanity_Analytics/

# 3. SSH and run
ssh user@your-production-server.com
cd /path/to/TruSanity_Analytics
./deploy-production.sh
```

---

## 🔍 Post-Deployment Verification

### 1. Check All Services Are Running

```bash
docker compose -f infra/docker-compose.yml ps
```

**Expected output:** All services should show "Up" status:
- netra_api
- netra_consumer
- netra_web
- netra_postgres
- netra_clickhouse
- netra_kafka
- netra_redis

### 2. Test API Health

```bash
curl http://localhost:3001/health
```

**Expected:** `{"status":"ok","timestamp":"..."}`

### 3. Test WordPress Plugin Auto-Create Endpoint

```bash
curl -X POST http://localhost:3001/v1/projects/auto-create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test WordPress Site",
    "timezone": "UTC",
    "tenantId": 1
  }'
```

**Expected:** 
```json
{
  "success": true,
  "project": {
    "id": 123,
    "name": "Test WordPress Site"
  },
  "apiKey": "trus_pk_...",
  "message": "Project created successfully! Copy the API key to your WordPress plugin."
}
```

### 4. Check Consumer is Processing Events

```bash
docker compose -f infra/docker-compose.yml logs consumer --tail=50
```

**Look for:** `✅ Inserted X events into ClickHouse`

### 5. Verify Dashboard Access

Open in browser: `http://your-domain.com/dashboard`

---

## 🔧 What Was Fixed

### 1. WordPress Plugin Auto-Create Feature
- **File:** `apps/api/src/routes/projects.ts`
- **Change:** Endpoint now accepts `tenantId` instead of `tenantEmail`
- **Reason:** The `tenants` table doesn't have an `email` field

### 2. WordPress Plugin Updates
- **Files:** 
  - `packages/plugin-wordpress/trusanity-analytics.php`
  - `packages/plugin-wordpress/admin.js`
- **Change:** Plugin now asks users for their Tenant ID from the dashboard
- **UI:** Added input field for Tenant ID in the auto-create section

### 3. TypeScript Build Errors
- **File:** `packages/sdk-js/src/index.ts`
- **Change:** Fixed nullable boolean return type in `evaluateFlag` method
- **Dependencies:** Added missing UI package dependencies

---

## 📝 WordPress Plugin Setup Instructions

After deployment, WordPress users should:

1. Install the Trusanity Analytics plugin
2. Go to Settings → Trusanity Analytics
3. Find their **Tenant ID** from the Trusanity dashboard (Settings page)
4. Enter the Tenant ID in the plugin
5. Click "Create Project Automatically"
6. The API key will be auto-filled and saved

---

## 🚨 Troubleshooting

### Services Won't Start

```bash
# Check Docker daemon
sudo systemctl status docker

# View logs for specific service
docker compose -f infra/docker-compose.yml logs <service-name>

# Restart specific service
docker compose -f infra/docker-compose.yml restart <service-name>
```

### Database Connection Issues

```bash
# Test PostgreSQL
docker exec -it netra_postgres psql -U netra -d netra_db -c "SELECT 1;"

# Test ClickHouse
docker exec -it netra_clickhouse clickhouse-client --query "SELECT 1"
```

### Port Already in Use

```bash
# Check what's using the ports
sudo netstat -tulpn | grep -E ':(3001|5433|6379|9092|8123)'

# Stop conflicting services or change ports in docker-compose.yml
```

---

## 🔄 Rollback Procedure

If something goes wrong:

```bash
# 1. Stop current services
docker compose -f infra/docker-compose.yml down

# 2. Find previous working commit
git log --oneline -10

# 3. Checkout previous version
git checkout <previous-commit-hash>

# 4. Rebuild and restart
docker compose -f infra/docker-compose.yml build --no-cache
docker compose -f infra/docker-compose.yml up -d
```

---

## 📊 Monitoring Commands

```bash
# View all logs in real-time
docker compose -f infra/docker-compose.yml logs -f

# View specific service logs
docker compose -f infra/docker-compose.yml logs -f api
docker compose -f infra/docker-compose.yml logs -f consumer

# Check resource usage
docker stats

# Check disk usage
docker system df
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change default passwords in `docker-compose.yml`
- [ ] Set strong `AUTH_SECRET` in `.env`
- [ ] Configure SSL/TLS certificates
- [ ] Set up firewall rules
- [ ] Enable database backups
- [ ] Review and restrict API access

---

## 📞 Support

For issues:
- Check logs: `docker compose -f infra/docker-compose.yml logs -f`
- Review `FIXES_APPLIED.md` for recent changes
- Review `PRODUCTION_DEPLOYMENT.md` for detailed troubleshooting

---

**Ready to deploy!** Choose your preferred method above and execute the commands.
