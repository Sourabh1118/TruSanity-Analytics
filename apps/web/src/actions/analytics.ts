'use server'

import { clickhouse } from '@/lib/clickhouse'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { tenantMembers } from '@netra/db/src/schema'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

/**
 * Validates the current session and retrieves the active Tenant ID.
 * Crucial for strict Multi-Tenant Data Isolation!
 */
/**
 * Validates the current session and retrieves the active Tenant ID.
 * Returns null if not authenticated or no tenant found (caller decides what to do).
 */
async function getActiveTenantId(): Promise<number | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const memberships = await db.select()
            .from(tenantMembers)
            .where(eq(tenantMembers.userId, session.user.id));

        if (!memberships || memberships.length === 0) return null;
        return memberships[0].tenantId;
    } catch (e) {
        console.error('getActiveTenantId failed:', e);
        return null;
    }
}


/**
 * Executes ClickHouse aggregations to get the top KPI metrics.
 */
export async function getDashboardKpis() {
    const tenantId = await getActiveTenantId();

    try {
        const query = `
            SELECT
                count(DISTINCT anonymous_id) as unique_visitors,
                count() as total_pageviews,
                avg(session_duration) as avg_duration,
                uniqExact(name) as unique_events_captured,
                count(DISTINCT JSONExtractString(properties, 'country')) as countries_reached
            FROM netra.events
            WHERE tenant_id = {tenantId: Int32}
              AND timestamp >= subtractDays(now(), 7)
        `;

        const resultSet = await clickhouse.query({
            query,
            query_params: { tenantId },
            format: 'JSONEachRow'
        });

        const rows = await resultSet.json<{
            unique_visitors: string;
            total_pageviews: string;
            avg_duration: string;
            unique_events_captured: string;
            countries_reached: string;
        }>();

        if (!rows || rows.length === 0 || !rows[0]) return null;

        const firstRow = rows[0];

        return {
            uniqueVisitors: parseInt(firstRow.unique_visitors, 10),
            totalPageviews: parseInt(firstRow.total_pageviews, 10),
            avgDuration: parseInt(firstRow.avg_duration, 10),
            countriesReached: parseInt(firstRow.countries_reached, 10)
        };
    } catch (e) {
        console.error('getDashboardKpis Failed:', e);
        return null;
    }
}

/**
 * Generates the time-series arrays for the main EChart (Unique Visitors vs Pageviews)
 */
export async function getTrafficOverTime() {
    const tenantId = await getActiveTenantId();

    try {
        const query = `
            SELECT
                toDayOfWeek(timestamp) as day_of_week,
                toStartOfDay(timestamp) as day_date,
                count(DISTINCT anonymous_id) as visitors,
                count() as pageviews
            FROM netra.events
            WHERE tenant_id = {tenantId: Int32}
              AND timestamp >= subtractDays(now(), 7)
            GROUP BY day_date, day_of_week
            ORDER BY day_date ASC
        `;

        const resultSet = await clickhouse.query({
            query,
            query_params: { tenantId },
            format: 'JSONEachRow'
        });

        const rows = await resultSet.json<{ day_of_week: string; visitors: string; pageviews: string }>();

        // Map ClickHouse day_of_week (1=Monday...7=Sunday) to string labels compatible with ECharts
        const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return {
            labels: rows.map(r => dayMap[parseInt(r.day_of_week) % 7]),
            visitorsData: rows.map(r => parseInt(r.visitors, 10)),
            pageviewsData: rows.map(r => parseInt(r.pageviews, 10))
        };
    } catch (e) {
        console.error('getTrafficOverTime Failed:', e);
        return { labels: [], visitorsData: [], pageviewsData: [] };
    }
}

/**
 * Gets the most recent events flowing through the system
 */
export async function getRecentEvents() {
    const tenantId = await getActiveTenantId();

    try {
        const query = `
            SELECT
                name as event,
                anonymous_id as user_id,
                JSONExtractString(properties, 'path') as path,
                timestamp
            FROM netra.events
            WHERE tenant_id = {tenantId: Int32}
            ORDER BY timestamp DESC
            LIMIT 5
        `;

        const resultSet = await clickhouse.query({
            query,
            query_params: { tenantId },
            format: 'JSONEachRow'
        });

        return await resultSet.json<{ event: string; user_id: string; path: string; timestamp: string }>();
    } catch (e) {
        console.error('getRecentEvents Failed:', e);
        return [];
    }
}

/**
 * Gets the raw table dump of all events for the tabular browser
 */
export async function getEventsTable(limit: number = 100) {
    const tenantId = await getActiveTenantId();
    try {
        const query = `
            SELECT
                name as event,
                anonymous_id as user_id,
                properties,
                timestamp
            FROM netra.events
            WHERE tenant_id = {tenantId: Int32}
            ORDER BY timestamp DESC
            LIMIT {limit: Int32}
        `;
        const resultSet = await clickhouse.query({
            query,
            query_params: { tenantId, limit },
            format: 'JSONEachRow'
        });
        return await resultSet.json<{ event: string; user_id: string; properties: string; timestamp: string }>();
    } catch (e) {
        console.error('getEventsTable Failed:', e);
        return [];
    }
}

/**
 * Aggregates top visited paths
 */
export async function getTopPages() {
    const tenantId = await getActiveTenantId();
    try {
        const query = `
            SELECT
                JSONExtractString(properties, 'path') as page,
                count() as views
            FROM netra.events
            WHERE tenant_id = {tenantId: Int32} AND name = '$pageview'
            GROUP BY page
            ORDER BY views DESC
            LIMIT 10
        `;
        const resultSet = await clickhouse.query({ query, query_params: { tenantId }, format: 'JSONEachRow' });
        return await resultSet.json<{ page: string; views: string }>();
    } catch (e) { return []; }
}

/**
 * Aggregates referring domains
 */
export async function getTopReferrers() {
    const tenantId = await getActiveTenantId();
    try {
        const query = `
            SELECT
                JSONExtractString(properties, 'referrer') as source,
                count() as visits
            FROM netra.events
            WHERE tenant_id = {tenantId: Int32} AND name = '$pageview' AND JSONExtractString(properties, 'referrer') != ''
            GROUP BY source
            ORDER BY visits DESC
            LIMIT 5
        `;
        const resultSet = await clickhouse.query({ query, query_params: { tenantId }, format: 'JSONEachRow' });
        return await resultSet.json<{ source: string; visits: string }>();
    } catch (e) { return []; }
}

/**
 * Aggregates browser demographics
 */
export async function getTopBrowsers() {
    const tenantId = await getActiveTenantId();
    try {
        const query = `
            SELECT
                JSONExtractString(properties, 'browser') as user_agent,
                count() as hits
            FROM netra.events
            WHERE tenant_id = {tenantId: Int32} AND JSONExtractString(properties, 'browser') != ''
            GROUP BY user_agent
            ORDER BY hits DESC
            LIMIT 5
        `;
        const resultSet = await clickhouse.query({ query, query_params: { tenantId }, format: 'JSONEachRow' });
        return await resultSet.json<{ user_agent: string; hits: string }>();
    } catch (e) { return []; }
}
