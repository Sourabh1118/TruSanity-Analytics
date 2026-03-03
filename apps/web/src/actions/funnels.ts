"use server";

import { clickhouse } from '@/lib/clickhouse';

export interface FunnelStep {
    name: string;
    eventName: string;
}

export interface FunnelResult {
    level: number;
    count: number;
    stepName: string;
    dropoffRate: number;
}

export async function getFunnelData(
    tenantId: string,
    projectId: string,
    steps: FunnelStep[],
    windowSeconds: number = 3600 // Default 1 hour window
): Promise<FunnelResult[]> {
    if (steps.length < 2) {
        throw new Error("Funnel requires at least two steps.");
    }

    // Protect against SQL injection by using native query parameterization for tenant/project
    // and strictly mapping the defined step conditions.
    const stepConditions = steps
        .map((step) => \`event_name = '\${step.eventName.replace(/'/g, "''")}'\`)
        .join(',\\n            ');

    const query = \`
        SELECT
            level,
            count() AS count
        FROM (
            SELECT
                user_id,
                windowFunnel(\${windowSeconds})(
                    timestamp,
                    \${stepConditions}
                ) AS level
            FROM events
            WHERE tenant_id = {tenantId:String} 
              AND project_id = {projectId:String}
            GROUP BY user_id
        )
        GROUP BY level
        ORDER BY level ASC;
    \`;

    try {
        const resultSet = await clickhouse.query({
            query: query,
            query_params: {
                tenantId,
                projectId
            },
            format: 'JSONEachRow'
        });

        const rawData: { level: number, count: string }[] = await resultSet.json();
        
        // Map raw levels to the actual step names and calculate dropoffs
        const results: FunnelResult[] = [];
        let previousCount = 0;

        // ClickHouse windowFunnel returns 0 for users who didn't even complete step 1.
        // We only care about levels > 0.
        for (let i = 0; i < steps.length; i++) {
            const level = i + 1;
            const row = rawData.find(r => r.level === level);
            const count = row ? parseInt(row.count, 10) : 0;
            
            let dropoffRate = 0;
            if (i > 0 && previousCount > 0) {
                dropoffRate = ((previousCount - count) / previousCount) * 100;
            }

            results.push({
                level,
                count,
                stepName: steps[i].name,
                dropoffRate: Number(dropoffRate.toFixed(1))
            });

            previousCount = count;
        }

        return results;
    } catch (error) {
        console.error("ClickHouse Funnel Query Error:", error);
        throw new Error("Failed to compute funnel query.");
    }
}
