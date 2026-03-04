'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { projects, apiKeys, tenantMembers } from '@netra/db/src/schema';
import { eq, desc, and } from 'drizzle-orm';
import crypto from 'crypto';

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

/** Returns all projects and their associated API Keys for the active tenant */
export async function getTenantProjects() {
    try {
        const tenantId = await getActiveTenantId();
        if (tenantId === null) return [];

        // Use db.select() — avoids db.query builder reliance on relation configs
        const tenantProjects = await db.select()
            .from(projects)
            .where(eq(projects.tenantId, tenantId))
            .orderBy(desc(projects.createdAt));

        return await Promise.all(tenantProjects.map(async (proj) => {
            const keys = await db.select()
                .from(apiKeys)
                .where(eq(apiKeys.projectId, proj.id))
                .orderBy(desc(apiKeys.createdAt));
            return { ...proj, apiKeys: keys };
        }));
    } catch (error) {
        console.error('Failed to fetch tenant projects:', error);
        return [];
    }
}

/** Creates a new project + auto-generates a default API key */
export async function createProject(name: string, timezone: string = 'UTC') {
    const tenantId = await getActiveTenantId();
    if (tenantId === null) throw new Error('Not authenticated or no tenant found. Please login again.');
    if (!name || name.trim().length < 2) throw new Error('Project name must be at least 2 characters');

    const [newProject] = await db.insert(projects)
        .values({ tenantId, name: name.trim(), timezone })
        .returning();

    if (!newProject) throw new Error('Failed to create project — database returned no result');

    const keyId = `trus_pk_${crypto.randomBytes(24).toString('hex')}`;
    await db.insert(apiKeys).values({
        id: keyId,
        projectId: newProject.id,
        name: 'Default Key',
        type: 'public',
        isActive: true,
    });

    return { project: newProject, apiKey: keyId };
}

/** Deletes a project owned by the current tenant (and its API keys) */
export async function deleteProject(projectId: string) {
    const tenantId = await getActiveTenantId();
    if (tenantId === null) throw new Error('Unauthorized or no tenant');

    const owned = await db.select()
        .from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.tenantId, tenantId)))
        .limit(1);

    if (!owned || owned.length === 0) throw new Error('Project not found or unauthorized');

    await db.delete(apiKeys).where(eq(apiKeys.projectId, projectId));
    await db.delete(projects).where(eq(projects.id, projectId));
}

/** Generates a new API key for an existing project */
export async function generateApiKey(projectId: string, name: string) {
    const tenantId = await getActiveTenantId();
    if (tenantId === null) throw new Error('Unauthorized or no tenant');

    const owned = await db.select()
        .from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.tenantId, tenantId)))
        .limit(1);

    if (!owned || owned.length === 0) throw new Error('Project not found or unauthorized');

    const keyId = `trus_pk_${crypto.randomBytes(24).toString('hex')}`;
    await db.insert(apiKeys).values({ id: keyId, projectId, name, type: 'public', isActive: true });
    return keyId;
}
