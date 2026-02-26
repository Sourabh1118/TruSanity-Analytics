-- ClickHouse initialization script
-- This runs when ClickHouse container starts for the first time

-- ──────────────────────────────────────────────────────────
-- Raw events table — MergeTree, sorted by (tenant_id, event_name, timestamp)
-- ORDER BY tenant_id first = all tenant data physically collocated
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS netra.events
(
    -- Tenant & project identification
    tenant_id       UInt32,
    project_id      UUID,

    -- Event identification
    event_id        UUID DEFAULT generateUUIDv4(),
    event_name      LowCardinality(String),
    timestamp       DateTime64(3, 'UTC'),
    server_timestamp DateTime64(3, 'UTC') DEFAULT now64(3),

    -- Session & user
    session_id      String,
    anonymous_id    String,
    user_id         String         DEFAULT '',

    -- Page / Screen context
    url             String         DEFAULT '',
    path            String         DEFAULT '',
    referrer        String         DEFAULT '',
    title           String         DEFAULT '',

    -- Device context
    platform        LowCardinality(String) DEFAULT 'web',
    device_type     LowCardinality(String) DEFAULT 'desktop',
    os              LowCardinality(String) DEFAULT '',
    os_version      String         DEFAULT '',
    browser         LowCardinality(String) DEFAULT '',
    browser_version String         DEFAULT '',
    screen_width    UInt16         DEFAULT 0,
    screen_height   UInt16         DEFAULT 0,

    -- Geographic context (resolved server-side from IP)
    country         LowCardinality(String) DEFAULT '',
    region          String         DEFAULT '',
    city            String         DEFAULT '',

    -- UTM / Traffic source
    utm_source      LowCardinality(String) DEFAULT '',
    utm_medium      LowCardinality(String) DEFAULT '',
    utm_campaign    String         DEFAULT '',
    utm_term        String         DEFAULT '',
    utm_content     String         DEFAULT '',

    -- Custom properties (flexible JSON)
    properties      String         DEFAULT '{}',  -- JSON string

    -- App version (mobile/game)
    app_version     String         DEFAULT ''
)
ENGINE = MergeTree()
PARTITION BY (toYYYYMM(timestamp), tenant_id)
ORDER BY (tenant_id, event_name, timestamp)
SETTINGS index_granularity = 8192;

-- ──────────────────────────────────────────────────────────
-- Sessions table — derived from events, one row per session
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS netra.sessions
(
    tenant_id       UInt32,
    project_id      UUID,
    session_id      String,
    anonymous_id    String,
    user_id         String         DEFAULT '',
    started_at      DateTime64(3, 'UTC'),
    ended_at        DateTime64(3, 'UTC'),
    duration_seconds UInt32        DEFAULT 0,
    pageview_count  UInt16         DEFAULT 0,
    event_count     UInt16         DEFAULT 0,
    entry_page      String         DEFAULT '',
    exit_page       String         DEFAULT '',
    referrer        String         DEFAULT '',
    utm_source      LowCardinality(String) DEFAULT '',
    utm_medium      LowCardinality(String) DEFAULT '',
    utm_campaign    String         DEFAULT '',
    device_type     LowCardinality(String) DEFAULT '',
    country         LowCardinality(String) DEFAULT '',
    is_bounce       UInt8          DEFAULT 0
)
ENGINE = MergeTree()
PARTITION BY (toYYYYMM(started_at), tenant_id)
ORDER BY (tenant_id, started_at, session_id)
SETTINGS index_granularity = 8192;

-- ──────────────────────────────────────────────────────────
-- Materialized View: Daily page metrics per project
-- Pre-aggregates to avoid expensive queries on hot dashboards
-- ──────────────────────────────────────────────────────────
CREATE MATERIALIZED VIEW IF NOT EXISTS netra.daily_pageviews
ENGINE = SummingMergeTree()
PARTITION BY (toYYYYMM(date), tenant_id)
ORDER BY (tenant_id, project_id, date, path)
AS SELECT
    tenant_id,
    project_id,
    toDate(timestamp) AS date,
    path,
    country,
    device_type,
    utm_source,
    utm_medium,
    count() AS pageviews,
    uniq(session_id) AS unique_sessions,
    uniq(anonymous_id) AS unique_visitors
FROM netra.events
WHERE event_name = '$pageview'
GROUP BY tenant_id, project_id, date, path, country, device_type, utm_source, utm_medium;

-- ──────────────────────────────────────────────────────────
-- Materialized View: Daily custom event counts
-- ──────────────────────────────────────────────────────────
CREATE MATERIALIZED VIEW IF NOT EXISTS netra.daily_events
ENGINE = SummingMergeTree()
PARTITION BY (toYYYYMM(date), tenant_id)
ORDER BY (tenant_id, project_id, date, event_name)
AS SELECT
    tenant_id,
    project_id,
    toDate(timestamp) AS date,
    event_name,
    count() AS event_count,
    uniq(session_id) AS unique_sessions,
    uniq(anonymous_id) AS unique_users
FROM netra.events
GROUP BY tenant_id, project_id, date, event_name;

-- ──────────────────────────────────────────────────────────
-- Materialized View: Real-time (hourly) event counts
-- ──────────────────────────────────────────────────────────
CREATE MATERIALIZED VIEW IF NOT EXISTS netra.hourly_events
ENGINE = SummingMergeTree()
PARTITION BY (toYYYYMM(hour), tenant_id)
ORDER BY (tenant_id, project_id, hour, event_name)
AS SELECT
    tenant_id,
    project_id,
    toStartOfHour(timestamp) AS hour,
    event_name,
    count() AS event_count,
    uniq(anonymous_id) AS unique_users
FROM netra.events
GROUP BY tenant_id, project_id, hour, event_name;
