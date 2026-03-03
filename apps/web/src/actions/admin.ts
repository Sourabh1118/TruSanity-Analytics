'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { subscriptions, billingEvents, tenants } from '@netra/db/src/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';

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

    // In a real scenario, MRR is calculated dynamically by joining plans
    // For this implementation, we will count subscriptions by status and 
    // multiply active Pro subs by the $49.00 USD cost.

    const allSubs = await db.select().from(subscriptions);

    let activeSubs = 0;
    let overdueSubs = 0;
    let totalMRR = 0;

    for (const sub of allSubs) {
        if (sub.status === 'active') {
            activeSubs++;
            if (sub.planId === 'pro_monthly') {
                totalMRR += 49; // $49.00
            }
        } else if (sub.status === 'past_due') {
            overdueSubs++;
        }
    }

    return {
        mrr: totalMRR,
        activeSubscriptions: activeSubs,
        overduePayments: overdueSubs,
    };
}

export async function getRecentBillingEvents(limit = 10) {
    await enforceSuperAdmin();

    // Perform an inner join between the billing events and the abstract tenants table
    const recentEvents = await db
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

    return recentEvents;
}
