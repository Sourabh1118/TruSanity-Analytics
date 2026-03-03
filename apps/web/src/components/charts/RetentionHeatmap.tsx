"use client";

import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

export interface CohortData {
    cohortDate: string;
    dayOffset: number;
    retentionRate: number;
}

interface RetentionHeatmapProps {
    data: CohortData[];
    days: number;
    height?: number | string;
}

export default function RetentionHeatmap({ data, days = 7, height = 400 }: RetentionHeatmapProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    // Fallback data if none provided
    const chartData = data && data.length > 0 ? data : [
        { cohortDate: '2023-10-01', dayOffset: 0, retentionRate: 100 },
        { cohortDate: '2023-10-01', dayOffset: 1, retentionRate: 45 },
        { cohortDate: '2023-10-01', dayOffset: 2, retentionRate: 35 },
        { cohortDate: '2023-10-01', dayOffset: 3, retentionRate: 30 },
        { cohortDate: '2023-10-02', dayOffset: 0, retentionRate: 100 },
        { cohortDate: '2023-10-02', dayOffset: 1, retentionRate: 50 },
        { cohortDate: '2023-10-02', dayOffset: 2, retentionRate: 40 },
        { cohortDate: '2023-10-03', dayOffset: 0, retentionRate: 100 },
        { cohortDate: '2023-10-03', dayOffset: 1, retentionRate: 60 }
    ];

    const option = useMemo(() => {
        // Extract unique dates for the Y axis
        const dates = Array.from(new Set(chartData.map(d => d.cohortDate))).sort();

        // Extract day offsets (Day 0, Day 1, Day 2...) for the X axis
        const dayLabels = Array.from({ length: days }, (_, i) => `Day ${i}`);

        // Format data into the [x, y, value] array structure required by ECharts Heatmap
        // x = dayOffset index, y = cohortDate index, value = retentionRate
        const heatmapData = chartData.map(d => [
            d.dayOffset,
            dates.indexOf(d.cohortDate),
            d.retentionRate || 0
        ]);

        return {
            tooltip: {
                position: 'top',
                formatter: (params: any) => {
                    const date = dates[params.value[1]];
                    const day = params.value[0];
                    const rate = params.value[2];
                    return `Cohort: ${date}<br/>Day ${day}: ${rate}%`;
                }
            },
            grid: {
                top: '10%',
                left: '10%',
                right: '5%',
                bottom: '15%'
            },
            xAxis: {
                type: 'category',
                data: dayLabels,
                splitArea: { show: true },
                axisLabel: { color: isDark ? '#9ca3af' : '#4b5563' }
            },
            yAxis: {
                type: 'category',
                data: dates,
                splitArea: { show: true },
                axisLabel: { color: isDark ? '#9ca3af' : '#4b5563' }
            },
            visualMap: {
                min: 0,
                max: 100,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '0%',
                inRange: {
                    color: ['#f1f5f9', '#bae6fd', '#3b82f6', '#1d4ed8'] // Slate-50 -> Sky-200 -> Blue-500 -> Blue-700
                },
                textStyle: {
                    color: isDark ? '#f3f4f6' : '#111827'
                }
            },
            series: [{
                name: 'Retention %',
                type: 'heatmap',
                data: heatmapData,
                label: {
                    show: true,
                    formatter: (params: any) => `${params.value[2]}%`,
                    color: isDark ? '#fff' : '#000'
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
    }, [chartData, days, isDark]);

    return (
        <ReactECharts
            option={option}
            style={{ height, width: '100%' }}
            theme={isDark ? 'dark' : 'light'}
            key={isDark ? 'dark-theme' : 'light-theme'}
        />
    );
}
