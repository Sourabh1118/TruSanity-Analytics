import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export interface TenantQuota {
    plan: 'free' | 'pro'
    limit: number
}

/**
 * Service to fetch tenant quotas from the TruSanity Storefront.
 *
 * Rather than querying the `tenants` table directly (which lives in
 * packages/db-billing and shouldn't be accessed by the Analytics API),
 * this fetching service asks the Storefront via an internal REST API.
 * 
 * Results are cached in Redis for 5 minutes to prevent slamming the
 * Storefront with high-velocity ingestion traffic.
 */
export async function getTenantQuota(tenantId: number): Promise<TenantQuota | null> {
    const cacheKey = `tenant:quota:${tenantId}`

    try {
        // 1. Check Redis Cache
        const cached = await redis.get(cacheKey)
        if (cached) {
            return JSON.parse(cached) as TenantQuota
        }

        // 2. Cache miss — Fetch from Storefront
        const storefrontUrl = process.env.STOREFRONT_URL || 'http://localhost:3002'
        const secret = process.env.INTERNAL_API_SECRET

        if (!secret) {
            console.error('[BillingService] Missing INTERNAL_API_SECRET env var. Cannot fetch quota.')
            return null
        }

        const res = await fetch(`${storefrontUrl}/api/internal/tenant-quota?tenantId=${tenantId}`, {
            headers: {
                Authorization: `Bearer ${secret}`
            },
            // Don't hang the ingestion pipeline if storefront is down
            signal: AbortSignal.timeout(2000)
        })

        if (!res.ok) {
            console.error(`[BillingService] Storefront returned ${res.status} for tenant ${tenantId}`)
            return null
        }

        const data = await res.json() as any
        const quota: TenantQuota = {
            plan: data.plan,
            limit: data.limit
        }

        // 3. Save to Cache (5 minutes TTL)
        await redis.set(cacheKey, JSON.stringify(quota), 'EX', 300)

        return quota

    } catch (err) {
        console.error('[BillingService] Failed to fetch quota:', err)
        return null
    }
}
