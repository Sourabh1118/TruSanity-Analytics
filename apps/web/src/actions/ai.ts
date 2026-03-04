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
            return []; // No project yet — return empty gracefully
        }

        // Use INTERNAL_API_URL (Docker service name) for server-to-server calls,
        // falling back to NEXT_PUBLIC_API_URL for local dev
        const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:3001';

        const response = await fetch(`${apiUrl}/v1/ai/insights`, {
            headers: {
                Authorization: `Bearer ${activeProject.id}`,
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('AI insights API responded with', response.status);
            return [];
        }

        const data = await response.json();
        return data.insights || [];
    } catch (error) {
        console.error("fetchAiInsights error", error);
        return []; // Gracefully return empty instead of throwing a 500
    }
}
