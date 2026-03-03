"use server";

import { db } from '@/lib/db';
import { apiKeys } from '@netra/db';
import { eq } from 'drizzle-orm';

export async function fetchAiInsights() {
    try {
        const activeProject = await db.query.apiKeys.findFirst({
            where: eq(apiKeys.type, 'public'),
            with: { project: true }
        });

        if (!activeProject) {
            throw new Error("No active public API key found.");
        }

        const response = await fetch('http://localhost:3001/v1/ai/insights', {
            headers: {
                Authorization: `Bearer ${activeProject.id}`,
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('Failed to generate insights');
        }

        const data = await response.json();
        return data.insights || [];
    } catch (error) {
        console.error("fetchAiInsights error", error);
        throw new Error("Could not connect to the AI analysis engine.");
    }
}
