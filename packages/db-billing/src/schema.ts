import { pgTable, text, timestamp, varchar, integer, uuid, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Tenants & Users ─────────────────────────────────────────

export const tenants = pgTable('tenants', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    plan: varchar('plan', { length: 50 }).notNull().default('free'),
    status: varchar('status', { length: 50 }).notNull().default('active'),
    stripeCustomerId: varchar('stripe_customer_id', { length: 100 }),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }),
    email: varchar('email', { length: 255 }).unique(),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    image: varchar('image', { length: 255 }),
    passwordHash: varchar('password_hash', { length: 255 }),
    role: varchar('role', { length: 50 }).notNull().default('user'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable(
    'accounts',
    {
        userId: uuid('userId')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        type: varchar('type', { length: 255 })
            .$type<'oauth' | 'oidc' | 'email'>()
            .notNull(),
        provider: varchar('provider', { length: 255 }).notNull(),
        providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
        refresh_token: text('refresh_token'),
        access_token: text('access_token'),
        expires_at: integer('expires_at'),
        token_type: varchar('token_type', { length: 255 }),
        scope: varchar('scope', { length: 255 }),
        id_token: text('id_token'),
        session_state: varchar('session_state', { length: 255 }),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
);

export const sessions = pgTable('sessions', {
    sessionToken: varchar('sessionToken', { length: 255 }).primaryKey(),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
    'verificationToken',
    {
        identifier: varchar('identifier', { length: 255 }).notNull(),
        token: varchar('token', { length: 255 }).notNull(),
        expires: timestamp('expires', { mode: 'date' }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
);

export const tenantMembers = pgTable('tenant_members', {
    tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    role: varchar('role', { length: 50 }).notNull().default('member'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.tenantId, t.userId] }),
}));

// ── Monetization ─────────────────────────────────────────────

export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
    provider: varchar('provider', { length: 50 }).notNull(),
    providerSubscriptionId: varchar('provider_subscription_id', { length: 255 }),
    planId: varchar('plan_id', { length: 100 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('active'),
    currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const billingEvents = pgTable('billing_events', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
    provider: varchar('provider', { length: 50 }).notNull(),
    eventType: varchar('event_type', { length: 255 }).notNull(),
    payload: text('payload').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── Relations ─────────────────────────────────────────────────

// ── Product Registry ────────────────────────────────────────

export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    iconUrl: varchar('icon_url', { length: 500 }),
    appUrl: varchar('app_url', { length: 500 }).notNull(),
    color: varchar('color', { length: 50 }).notNull().default('#6366f1'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tenantProducts = pgTable('tenant_products', {
    tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    grantedAt: timestamp('granted_at').defaultNow().notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.tenantId, t.productId] }),
}));

// ── Relations ─────────────────────────────────────────────────

export const tenantsRelations = relations(tenants, ({ many }) => ({
    members: many(tenantMembers),
    subscriptions: many(subscriptions),
    billingEvents: many(billingEvents),
    products: many(tenantProducts),
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

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    tenant: one(tenants, {
        fields: [subscriptions.tenantId],
        references: [tenants.id],
    }),
}));

export const billingEventsRelations = relations(billingEvents, ({ one }) => ({
    tenant: one(tenants, {
        fields: [billingEvents.tenantId],
        references: [tenants.id],
    }),
}));

export const productsRelations = relations(products, ({ many }) => ({
    tenants: many(tenantProducts),
}));

export const tenantProductsRelations = relations(tenantProducts, ({ one }) => ({
    tenant: one(tenants, { fields: [tenantProducts.tenantId], references: [tenants.id] }),
    product: one(products, { fields: [tenantProducts.productId], references: [products.id] }),
}));
