'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { projects, apiKeys, tenantMembers } from '@netra/db/src/schema';
import { eq, desc, and } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Validates the current session and retrieves the active Tenant ID.
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
        console.error('getActiveTenantId (projects) failed:', e);
        return null;
    }
}


/**
 * Returns all projects and their associated API Keys for the active tenant
 */
export async function getTenantProjects() {
    try {
        const tenantId = await getActiveTenantId();
        if (tenantId === null) return [];

        const tenantProjects = await db.query.projects.findMany({
            where: eq(projects.tenantId, tenantId),
            orderBy: [desc(projects.createdAt)],
        });

        const projectsWithKeys = await Promise.all(
            tenantProjects.map(async (proj) => {
                const keys = await db.select()
                    .from(apiKeys)
                    .where(eq(apiKeys.projectId, proj.id))
                    .orderBy(desc(apiKeys.createdAt));
                return { ...proj, apiKeys: keys };
            })
        );

        return projectsWithKeys;
    } catch (error) {
        console.error("Failed to fetch tenant projects:", error);
        return [];
    }
}

/**
 * Generates a new cryptographic Public Key (trus_pk_...) and binds it to a project
 */
export async function generateApiKey(projectId: string, name: string) {
    const tenantId = await getActiveTenantId();
    if (tenantId === null) throw new Error('Unauthorized or no tenant');

    const project = await db.select()
        .from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.tenantId, tenantId)))
        .limit(1);

    if (!project || project.length === 0) {
        throw new Error('Project not found or unauthorized');
    }

    // Generate a secure 32-byte UUID-like cryptographic string
    const rawEntropy = crypto.randomBytes(24).toString('hex');
    const fullKeyString = `trus_pk_${rawEntropy}`;

    // Insert into DB
    await db.insert(apiKeys).values({
        id: fullKeyString,
        projectId: projectId,
        name: name,
        type: 'public',
        isActive: true,
    });

    return fullKeyString;
}
