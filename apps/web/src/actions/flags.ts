"use server";

import { db } from '@/lib/db';
import { featureFlags } from '@netra/db';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getFeatureFlags(projectId: string) {
    try {
        const flags = await db.query.featureFlags.findMany({
            where: eq(featureFlags.projectId, projectId),
            orderBy: (flags, { desc }) => [desc(flags.createdAt)],
        });
        return flags;
    } catch (error) {
        console.error("Failed to fetch feature flags:", error);
        throw new Error("Could not retrieve feature flags.");
    }
}

export async function createFeatureFlag(projectId: string, key: string, description: string, rolloutPercentage: number = 0) {
    try {
        await db.insert(featureFlags).values({
            projectId,
            key,
            description,
            isActive: rolloutPercentage > 0,
            rolloutPercentage
        });
        revalidatePath('/dashboard/flags');
        return { success: true };
    } catch (error) {
        console.error("Failed to create feature flag:", error);
        throw new Error("Could not create feature flag. Ensure the key is unique.");
    }
}

export async function toggleFeatureFlag(flagId: string, projectId: string, isActive: boolean) {
    try {
        await db.update(featureFlags)
            .set({
                isActive,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(featureFlags.id, flagId),
                    eq(featureFlags.projectId, projectId) // Security constraint
                )
            );
        revalidatePath('/dashboard/flags');
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle feature flag:", error);
        throw new Error("Could not toggle feature flag.");
    }
}

export async function updateFlagRollout(flagId: string, projectId: string, percentage: number) {
    try {
        await db.update(featureFlags)
            .set({
                rolloutPercentage: percentage,
                isActive: percentage > 0,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(featureFlags.id, flagId),
                    eq(featureFlags.projectId, projectId)
                )
            );
        revalidatePath('/dashboard/flags');
        return { success: true };
    } catch (error) {
        console.error("Failed to update feature flag rollout:", error);
        throw new Error("Could not update feature flag.");
    }
}
