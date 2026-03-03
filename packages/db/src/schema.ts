/**
 * @trusanity/db — unified schema re-exporter
 *
 * This package re-exports all table definitions from the two domain-specific
 * sub-packages so that existing `import { ... } from '@netra/db'` or
 * `import { ... } from '@trusanity/db'` calls continue to work unchanged
 * throughout the monorepo during Phase 1.
 *
 * In Phase 2, individual apps will import directly from:
 *   - @trusanity/db-billing   (tenants, users, auth, subscriptions, billingEvents)
 *   - @trusanity/db-analytics (projects, apiKeys, featureFlags, trackingRules, alerts, reportSchedules)
 */

export * from '@trusanity/db-billing';
export * from '@trusanity/db-analytics';
