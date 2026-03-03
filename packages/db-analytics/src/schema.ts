import { pgTable, timestamp, varchar, integer, uuid, boolean, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Projects & Tracking ─────────────────────────────────────

export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: integer('tenant_id').notNull(), // FK to tenants in db-billing (no cross-schema FK in Drizzle)
    name: varchar('name', { length: 255 }).notNull(),
    timezone: varchar('timezone', { length: 255 }).notNull().default('UTC'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
    id: varchar('id', { length: 255 }).primaryKey(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull().default('public'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const trackingRules = pgTable('tracking_rules', {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    eventName: varchar('event_name', { length: 255 }).notNull(),
    cssSelector: varchar('css_selector', { length: 500 }).notNull(),
    pageUrlMatch: varchar('page_url_match', { length: 500 }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const featureFlags = pgTable('feature_flags', {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    key: varchar('key', { length: 255 }).notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(false).notNull(),
    rolloutPercentage: integer('rollout_percentage').default(100).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const alerts = pgTable('alerts', {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    metricName: varchar('metric_name', { length: 255 }).notNull(),
    operator: varchar('operator', { length: 10 }).notNull(),
    threshold: integer('threshold').notNull(),
    windowMinutes: integer('window_minutes').default(60).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    notifiedAt: timestamp('notified_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reportSchedules = pgTable('report_schedules', {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    emails: text('emails').notNull(),
    scheduleConfig: varchar('schedule_config', { length: 50 }).notNull().default('weekly'),
    isActive: boolean('is_active').default(true).notNull(),
    lastSentAt: timestamp('last_sent_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── Relations ─────────────────────────────────────────────────

export const projectsRelations = relations(projects, ({ many }) => ({
    apiKeys: many(apiKeys),
    trackingRules: many(trackingRules),
    featureFlags: many(featureFlags),
    alerts: many(alerts),
    reportSchedules: many(reportSchedules),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
    project: one(projects, {
        fields: [apiKeys.projectId],
        references: [projects.id],
    }),
}));

export const trackingRulesRelations = relations(trackingRules, ({ one }) => ({
    project: one(projects, {
        fields: [trackingRules.projectId],
        references: [projects.id],
    }),
}));

export const featureFlagsRelations = relations(featureFlags, ({ one }) => ({
    project: one(projects, {
        fields: [featureFlags.projectId],
        references: [projects.id],
    }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
    project: one(projects, {
        fields: [alerts.projectId],
        references: [projects.id],
    }),
}));

export const reportSchedulesRelations = relations(reportSchedules, ({ one }) => ({
    project: one(projects, {
        fields: [reportSchedules.projectId],
        references: [projects.id],
    }),
}));
