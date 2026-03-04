'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { clickhouse } from '@/lib/clickhouse';
import { subscriptions, billingEvents, tenants, users, tenantMembers, projects } from '@netra/db/src/schema';
import { desc, eq, sql, count } from 'drizzle-orm';

/**
 * Validates the current session is an active Super Admin.
 */
async function enforceSuperAdmin() {
    const session = await auth();
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized Access: Minimum role SUPER_ADMIN required');
    }
}

export async function getGlobalBillingStats() {
    await enforceSuperAdmin();
    const allSubs = await db.select().from(subscriptions);
    let activeSubs = 0, overdueSubs = 0, totalMRR = 0;
    for (const sub of allSubs) {
        if (sub.status === 'active') { activeSubs++; if (sub.planId === 'pro_monthly') totalMRR += 49; }
        else if (sub.status === 'past_due') overdueSubs++;
    }
    return { mrr: totalMRR, activeSubscriptions: activeSubs, overduePayments: overdueSubs };
}

export async function getRecentBillingEvents(limit = 10) {
    await enforceSuperAdmin();
    return await db
        .select({
            id: billingEvents.id,
            provider: billingEvents.provider,
            eventType: billingEvents.eventType,
            createdAt: billingEvents.createdAt,
            tenantName: tenants.name,
            tenantSlug: tenants.slug,
        })
        .from(billingEvents)
        .innerJoin(tenants, eq(billingEvents.tenantId, tenants.id))
        .orderBy(desc(billingEvents.createdAt))
        .limit(limit);
}

/**
 * Returns top-level SaaS platform stats for the admin overview.
 */
export async function getAdminStats() {
    await enforceSuperAdmin();

    const [tenantCount] = await db.select({ value: count() }).from(tenants);
    const [userCount] = await db.select({ value: count() }).from(users);
    const [projectCount] = await db.select({ value: count() }).from(projects);
    const [subCount] = await db.select({ value: count() }).from(subscriptions).where(eq(subscriptions.status, 'active'));

    let totalEvents = 0;
    try {
        const result = await clickhouse.query({ query: 'SELECT count() as total FROM netra.events', format: 'JSONEachRow' });
        const rows = await result.json<{ total: string }>();
        if (rows?.[0]) totalEvents = parseInt(rows[0].total, 10);
    } catch { /* ClickHouse empty */ }

    return {
        tenants: tenantCount?.value ?? 0,
        users: userCount?.value ?? 0,
        projects: projectCount?.value ?? 0,
        activeSubscriptions: subCount?.value ?? 0,
        totalEvents,
    };
}

/**
 * Returns all tenants with member count and subscription plan info.
 */
export async function getAllTenants() {
    await enforceSuperAdmin();
    const allTenants = await db.select().from(tenants).orderBy(desc(tenants.createdAt));

    return await Promise.all(allTenants.map(async (tenant) => {
        const [memberCountRow] = await db.select({ value: count() }).from(tenantMembers).where(eq(tenantMembers.tenantId, tenant.id));
        const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.tenantId, tenant.id)).limit(1);
        return { ...tenant, memberCount: memberCountRow?.value ?? 0, subscription: sub ?? null };
    }));
}

/**
 * Health check: ping Postgres and ClickHouse with real queries.
 */
export async function getSystemHealth() {
    await enforceSuperAdmin();

    let postgresStatus: 'ok' | 'error' = 'error';
    let postgresLatencyMs = 0;
    try {
        const t0 = Date.now();
        await db.select({ v: sql<number>`1` }).from(tenants).limit(1);
        postgresLatencyMs = Date.now() - t0;
        postgresStatus = 'ok';
    } catch { /* error */ }

    let clickhouseStatus: 'ok' | 'error' = 'error';
    let clickhouseEvents = 0;
    let clickhouseLatencyMs = 0;
    try {
        const t0 = Date.now();
        const result = await clickhouse.query({ query: 'SELECT count() as n FROM netra.events', format: 'JSONEachRow' });
        const rows = await result.json<{ n: string }>();
        clickhouseLatencyMs = Date.now() - t0;
        clickhouseEvents = parseInt(rows?.[0]?.n ?? '0', 10);
        clickhouseStatus = 'ok';
    } catch { /* error */ }

    return { postgresStatus, postgresLatencyMs, clickhouseStatus, clickhouseEvents, clickhouseLatencyMs };
}
