"use client";

import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

export interface FunnelDataPoint {
    name: string;
    value: number; // The count at this level
}

interface FunnelChartProps {
    data: FunnelDataPoint[];
    height?: number | string;
}

export default function FunnelChart({ data, height = 400 }: FunnelChartProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    // Fallback data for demo or empty states
    const chartData = data && data.length > 0 ? data : [
        { value: 12400, name: 'Pageviews' },
        { value: 9200, name: 'Product Views' },
        { value: 5800, name: 'Add to Cart' },
        { value: 2100, name: 'Checkout' },
        { value: 1400, name: 'Purchase' }
    ];

    const maxVal = Math.max(...chartData.map(d => d.value), 100);

    const option = useMemo(() => {
        return {
            title: {
                text: 'Conversion Funnel',
                left: 'center',
                textStyle: {
                    color: isDark ? '#f3f4f6' : '#111827',
                    fontWeight: 'normal',
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} users'
            },
            toolbox: {
                feature: {
                    dataView: { readOnly: false },
                    restore: {},
                    saveAsImage: {}
                }
            },
            legend: {
                data: chartData.map(d => d.name),
                bottom: 0,
                textStyle: {
                    color: isDark ? '#9ca3af' : '#4b5563'
                }
            },
            series: [
                {
                    name: 'Conversion Steps',
                    type: 'funnel',
                    left: '10%',
                    top: 60,
                    bottom: 60,
                    width: '80%',
                    min: 0,
                    max: maxVal,
                    minSize: '0%',
                    maxSize: '100%',
                    sort: 'descending',
                    gap: 2,
                    label: {
                        show: true,
                        position: 'inside',
                        formatter: '{c} ({d}%)',
                        color: '#fff',
                        fontWeight: 'bold'
                    },
                    labelLine: {
                        length: 10,
                        lineStyle: {
                            width: 1,
                            type: 'solid'
                        }
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    emphasis: {
                        label: {
                            fontSize: 14
                        }
                    },
                    data: chartData
                }
            ],
            color: [
                '#3b82f6', // blue-500
                '#8b5cf6', // violet-500
                '#ec4899', // pink-500
                '#f43f5e', // rose-500
                '#f97316'  // orange-500
            ]
        };
    }, [chartData, isDark, maxVal]);

    return (
        <ReactECharts
            option={option}
            style={{ height, width: '100%' }}
            theme={isDark ? 'dark' : 'light'}
            // Using key to force rehydration on theme change helps Echarts adapt gracefully without visual bugs
            key={isDark ? 'dark-theme' : 'light-theme'}
        />
    );
}
