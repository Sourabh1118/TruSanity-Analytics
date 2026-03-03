"use server";

import { db } from '@/lib/db';
import { alerts } from '@netra/db';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getAlerts(projectId: string) {
    try {
        const rows = await db.query.alerts.findMany({
            where: eq(alerts.projectId, projectId),
            orderBy: (rows, { desc }) => [desc(rows.createdAt)],
        });
        return rows;
    } catch (error) {
        console.error("Failed to fetch alerts:", error);
        throw new Error("Could not retrieve alerts.");
    }
}

export async function createAlert(
    projectId: string,
    name: string,
    metricName: string,
    operator: string,
    threshold: number,
    windowMinutes: number
) {
    try {
        await db.insert(alerts).values({
            projectId,
            name,
            metricName,
            operator,
            threshold,
            windowMinutes
        });
        revalidatePath('/dashboard/alerts');
        return { success: true };
    } catch (error) {
        console.error("Failed to create alert:", error);
        throw new Error("Could not create alert.");
    }
}

export async function deleteAlert(alertId: string, projectId: string) {
    try {
        await db.delete(alerts).where(
            and(
                eq(alerts.id, alertId),
                eq(alerts.projectId, projectId)
            )
        );
        revalidatePath('/dashboard/alerts');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete alert:", error);
        throw new Error("Could not delete alert.");
    }
}
