"use server";

import { clickhouse } from '@/lib/clickhouse';

export interface CohortData {
    cohortDate: string;
    dayOffset: number;
    activeUsers: number;
    retentionRate: number;
}

export async function getCohortRetention(
    tenantId: string,
    projectId: string,
    days: number = 7
): Promise<CohortData[]> {
    // We calculate retention over a rolling `days` period window.
    const query = \`
        WITH UserCohorts AS (
            SELECT 
                user_id,
                -- The very first time we ever saw this user
                MIN(toDate(timestamp)) OVER (PARTITION BY user_id) AS cohort_date,
                toDate(timestamp) AS active_date
            FROM events
            WHERE tenant_id = {tenantId:String} AND project_id = {projectId:String}
        )
        SELECT 
            toString(cohort_date) AS cohort_date,
            dateDiff('day', cohort_date, active_date) AS day_offset,
            count(DISTINCT user_id) AS active_users
        FROM UserCohorts
        WHERE cohort_date >= today() - INTERVAL {days:UInt32} DAY
          AND day_offset <= {days:UInt32}
        GROUP BY cohort_date, day_offset
        ORDER BY cohort_date ASC, day_offset ASC
    \`;

    try {
        const resultSet = await clickhouse.query({
            query: query,
            query_params: {
                tenantId,
                projectId,
                days
            },
            format: 'JSONEachRow'
        });

        // rawData: { cohort_date: '2023-10-01', day_offset: 0, active_users: '150' }
        const rawData: any[] = await resultSet.json();

        // Calculate retention rate %
        // To do this, we need the "base" active_users where day_offset = 0 for each cohort
        const cohortBaseSizes: Record<string, number> = {};
        
        rawData.forEach(row => {
            if (parseInt(row.day_offset, 10) === 0) {
                cohortBaseSizes[row.cohort_date] = parseInt(row.active_users, 10);
            }
        });

        const results: CohortData[] = rawData.map(row => {
            const baseSize = cohortBaseSizes[row.cohort_date] || 1; 
            const activeCount = parseInt(row.active_users, 10);
            const rate = (activeCount / baseSize) * 100;

            return {
                cohortDate: row.cohort_date,
                dayOffset: parseInt(row.day_offset, 10),
                activeUsers: activeCount,
                retentionRate: Number(rate.toFixed(1))
            };
        });

        return results;

    } catch (error) {
        console.error("ClickHouse Cohort Query Error:", error);
        throw new Error("Failed to compute cohort retention query.");
    }
}
