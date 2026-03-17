# Fixes Applied - March 17, 2026

## Issue 1: Events Not Appearing on Dashboard

### Problem
Events were being ingested into Kafka and inserted into ClickHouse by the consumer, but the dashboard showed no data.

### Root Cause
The analytics queries were using incorrect column names:
- Queries used: `name`, `JSONExtractString(properties, 'path')`, `JSONExtractString(properties, 'country')`, etc.
- Actual ClickHouse schema columns: `event_name`, `path`, `country`, `referrer`, `browser` (direct columns, not JSON extraction)

### Solution
Fixed all analytics queries in `apps/web/src/actions/analytics.ts`:
1. Changed `name` → `event_name`
2. Changed `JSONExtractString(properties, 'path')` → `path`
3. Changed `JSONExtractString(properties, 'country')` → `country`
4. Changed `JSONExtractString(properties, 'referrer')` → `referrer`
5. Changed `JSONExtractString(properties, 'browser')` → `browser`
6. Removed `avg(session_duration)` (column doesn't exist) → set to `0`

### Files Modified
- `apps/web/src/actions/analytics.ts` - Fixed 6 queries:
  - `getDashboardKpis()`
  - `getTrafficOverTime()`
  - `getRecentEvents()`
  - `getEventsTable()`
  - `getTopPages()`
  - `getTopReferrers()`
  - `getTopBrowsers()`

---

## Issue 2: WordPress Plugin Auto-Project Creation

### Problem
Users had to manually create a project in the Trusanity dashboard and copy the API key to the WordPress plugin, which was cumbersome.

### Solution
Added a one-click auto-project creation feature to the WordPress plugin:

1. **New API Endpoint** (`apps/api/src/routes/projects.ts`):
   - `POST /v1/projects/auto-create`
   - Accepts: `{ name, timezone, tenantEmail }`
   - Auto-creates tenant if doesn't exist (by email)
   - Creates project and generates API key
   - Returns project details and API key

2. **WordPress Plugin Updates** (`packages/plugin-wordpress/`):
   - Added "Auto-Create Project" button in admin settings
   - New AJAX handler `ajax_auto_create_project()` in PHP
   - Auto-fills API key field after successful creation
   - Auto-saves settings after project creation
   - Beautiful UI with gradient box and clear instructions

3. **UI Enhancements**:
   - Added "Option 1" (manual) vs "Option 2" (auto-create) flow
   - Visual divider with "OR" between options
   - Loading spinner during project creation
   - Success/error messages with API key display
   - Responsive design matching existing plugin style

### Files Modified
- `apps/api/src/routes/projects.ts` - NEW FILE
- `apps/api/src/index.ts` - Registered new route
- `packages/plugin-wordpress/trusanity-analytics.php`:
  - Added `ajax_auto_create_project()` method
  - Updated admin assets localization
  - Added auto-create UI section
- `packages/plugin-wordpress/admin.js`:
  - Added auto-create button handler
  - Auto-submit form after success
- `packages/plugin-wordpress/admin.css`:
  - Added `.trus-auto-create-box` styles
  - Added `.trus-divider` styles
  - Added spin animation

---

## Testing Instructions

### 1. Rebuild and Restart Services
```bash
cd TruSanity_Analytics
docker-compose down
docker-compose build
docker-compose up -d
```

### 2. Verify Events Appear on Dashboard
1. Send test events using the existing test script or tracking SDK
2. Wait 2-5 seconds for consumer to process
3. Open dashboard at `http://localhost:3000/dashboard`
4. Verify:
   - KPI cards show data (Unique Visitors, Total Pageviews, etc.)
   - Traffic chart displays data
   - Recent events table populated
   - Top pages and referrers show data

### 3. Test WordPress Plugin Auto-Create
1. Install WordPress plugin from `packages/plugin-wordpress/`
2. Go to Settings → Trusanity Analytics
3. Click "Create Project Automatically" button
4. Verify:
   - Success message appears
   - API key auto-fills in the field
   - Settings auto-save
   - Connection shows as "Active"

---

## Data Flow Verification

### Current Architecture
```
Browser/WordPress → API (/v1/ingest) → Kafka (netra.events topic) 
→ Consumer → ClickHouse (netra.events table) → Dashboard Queries
```

### Key Points
- API enriches events with `tenant_id`, `project_id`, `event_name`, etc.
- Consumer inserts directly into ClickHouse using JSONEachRow format
- Dashboard queries use ClickHouse SQL with correct column names
- All queries filter by `tenant_id` for multi-tenancy

---

## Deployment Instructions

### 1. Rebuild Docker Containers
```bash
cd TruSanity_Analytics
docker compose -f infra/docker-compose.yml down
docker compose -f infra/docker-compose.yml build
docker compose -f infra/docker-compose.yml up -d
```

### 2. Verify Services Are Running
```bash
docker compose -f infra/docker-compose.yml ps
docker compose -f infra/docker-compose.yml logs -f api
docker compose -f infra/docker-compose.yml logs -f consumer
```

### 3. Test the Dashboard
1. Open `http://localhost:3000/dashboard`
2. Send test events (use existing test script or WordPress plugin)
3. Verify data appears in KPI cards, charts, and tables

### 4. Test WordPress Auto-Create
1. Install plugin from `packages/plugin-wordpress/`
2. Go to Settings → Trusanity Analytics
3. Click "Create Project Automatically"
4. Verify API key auto-fills and connection shows "Active"

## Next Steps

1. Monitor consumer logs for successful insertions
2. Check ClickHouse directly if needed:
   ```sql
   SELECT * FROM netra.events ORDER BY timestamp DESC LIMIT 10;
   ```
3. Test with real WordPress site traffic
4. Consider adding session duration calculation (currently set to 0)
5. Add more comprehensive error handling in auto-create endpoint

---

## Notes

- The consumer is working correctly (logs show "✅ Inserted X events into ClickHouse")
- The issue was purely in the query layer, not the ingestion pipeline
- WordPress plugin now provides the smoothest onboarding experience possible
- All changes are backward compatible with existing installations
