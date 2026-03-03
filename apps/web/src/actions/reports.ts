"use server";

import { db } from '@/lib/db';
import { reportSchedules } from '@netra/db';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getReportSchedules(projectId: string) {
    try {
        const rows = await db.query.reportSchedules.findMany({
            where: eq(reportSchedules.projectId, projectId),
            orderBy: (rows, { desc }) => [desc(rows.createdAt)],
        });
        return rows;
    } catch (error) {
        console.error("Failed to fetch report schedules:", error);
        throw new Error("Could not retrieve report schedules.");
    }
}

export async function createReportSchedule(
    projectId: string,
    name: string,
    emails: string,
    scheduleConfig: string
) {
    try {
        await db.insert(reportSchedules).values({
            projectId,
            name,
            emails,
            scheduleConfig,
        });
        revalidatePath('/dashboard/reports');
        return { success: true };
    } catch (error) {
        console.error("Failed to create report schedule:", error);
        throw new Error("Could not create report schedule.");
    }
}

export async function deleteReportSchedule(scheduleId: string, projectId: string) {
    try {
        await db.delete(reportSchedules).where(
            and(
                eq(reportSchedules.id, scheduleId),
                eq(reportSchedules.projectId, projectId)
            )
        );
        revalidatePath('/dashboard/reports');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete report schedule:", error);
        throw new Error("Could not delete report schedule.");
    }
}
