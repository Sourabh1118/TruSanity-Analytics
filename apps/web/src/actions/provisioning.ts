'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users, tenants, tenantMembers, projects, apiKeys } from '@netra/db/src/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Gets or auto-provisions the tenant ID for the authenticated user.
 *
 * AUTO-PROVISIONING: If the user has a valid Storefront JWT but no tenant
 * in the Analytics DB yet, this creates: user record → tenant → tenant_member
 * → default project + API key. Eliminates manual DB seeding requirements.
 */
export async function getActiveTenantIdOrProvision(): Promise<number | null> {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) return null;

    try {
        // Fast path: user already has a tenant
        const existing = await db.select()
            .from(tenantMembers)
            .where(eq(tenantMembers.userId, session.user.id))
            .limit(1);

        if (existing.length > 0) return existing[0].tenantId;

        // Slow path: first SSO visit — auto-provision everything
        console.log(`[Provisioning] Creating tenant for first-time user: ${session.user.email}`);

        const userId = session.user.id;
        const userEmail = session.user.email;
        const userName = session.user.name || userEmail.split('@')[0];

        // Upsert user (needed for tenant_members FK)
        await db.insert(users).values({
            id: userId,
            email: userEmail,
            name: userName,
            role: (session.user as any).role || 'USER',
            passwordHash: '',
        }).onConflictDoUpdate({
            target: users.id,
            set: { email: userEmail, name: userName, updatedAt: new Date() },
        });

        // Create tenant
        const emailDomain = userEmail.split('@')[1]?.split('.')[0] ?? 'workspace';
        const slug = `${emailDomain}-${userId.slice(0, 6)}`;
        const tenantName = `${(userName ?? 'User').split(' ')[0]}'s Workspace`;

        const tenantRows = await db.insert(tenants).values({
            name: tenantName, slug, plan: 'free', status: 'active',
        }).returning();

        const newTenant = tenantRows[0];
        if (!newTenant) throw new Error('Failed to create tenant');

        // Create tenant_member
        await db.insert(tenantMembers).values({
            tenantId: newTenant.id, userId, role: 'admin',
        }).onConflictDoNothing();

        // Create default project + API key so dashboard isn't empty
        const projectRows = await db.insert(projects).values({
            tenantId: newTenant.id, name: 'My Website', timezone: 'UTC',
        }).returning();

        const newProject = projectRows[0];
        if (newProject) {
            const keyId = `trus_pk_${crypto.randomBytes(24).toString('hex')}`;
            await db.insert(apiKeys).values({
                id: keyId, projectId: newProject.id, name: 'Default Key', type: 'public', isActive: true,
            });
        }

        console.log(`[Provisioning] Done. Tenant ID: ${newTenant.id}`);
        return newTenant.id;

    } catch (e) {
        console.error('[Provisioning] Failed:', e);
        return null;
    }
}
