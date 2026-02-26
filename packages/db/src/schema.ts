import { pgTable, serial, text, timestamp, varchar, integer, uuid, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Tenants & Users ─────────────────────────────────────────

export const tenants = pgTable('tenants', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    plan: varchar('plan', { length: 50 }).notNull().default('free'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }), // Nullable for OAuth
    avatarUrl: varchar('avatar_url', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tenantMembers = pgTable('tenant_members', {
    tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    role: varchar('role', { length: 50 }).notNull().default('member'), // owner, admin, member
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.tenantId, t.userId] }),
}));

// ── Projects & Tracking ─────────────────────────────────────

export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    timezone: varchar('timezone', { length: 255 }).notNull().default('UTC'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
    id: varchar('id', { length: 255 }).primaryKey(), // Generated as netra_pk_xxx etc
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull().default('public'), // public, secret
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const trackingRules = pgTable('tracking_rules', {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    eventName: varchar('event_name', { length: 255 }).notNull(),
    cssSelector: varchar('css_selector', { length: 500 }).notNull(),
    pageUrlMatch: varchar('page_url_match', { length: 500 }), // Optional path restriction
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ── Relations ───────────────────────────────────────────────

export const tenantsRelations = relations(tenants, ({ many }) => ({
    members: many(tenantMembers),
    projects: many(projects),
}));

export const usersRelations = relations(users, ({ many }) => ({
    tenantMembers: many(tenantMembers),
}));

export const tenantMembersRelations = relations(tenantMembers, ({ one }) => ({
    tenant: one(tenants, {
        fields: [tenantMembers.tenantId],
        references: [tenants.id],
    }),
    user: one(users, {
        fields: [tenantMembers.userId],
        references: [users.id],
    }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [projects.tenantId],
        references: [tenants.id],
    }),
    apiKeys: many(apiKeys),
    trackingRules: many(trackingRules),
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
