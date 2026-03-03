'use client'

import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, Eye, MousePointerClick, Clock, TrendingUp, Users, Globe2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { formatNumber } from '@/lib/utils'
import AiInsights from '@/components/dashboard/AiInsights'
import React from 'react'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

const ICON_MAP: Record<string, React.ElementType> = {
    Users,
    Eye,
    Clock,
    MousePointerClick,
    TrendingUp,
    Globe2
}

export default function DashboardLiveClient({ metrics, traffic, recentEvents, topSources, topPages }: any) {

    function MetricCard({ label, value, change, icon, color }: any) {
        const positive = change >= 0
        const Icon = ICON_MAP[icon] || Users;
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 border border-border hover:border-border-strong transition-all group"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                </div>
                <div className="text-3xl font-bold text-text-primary mb-1 tabular-nums">
                    {typeof value === 'number' ? formatNumber(value) : value}
                </div>
                <div className="text-sm text-text-muted">{label}</div>
            </motion.div>
        )
    }

    function getMainChartOption() {
        return {
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis', backgroundColor: 'oklch(0.16 0.02 264)', textStyle: { color: 'white' } },
            legend: { data: ['Unique Visitors', 'Pageviews'], textStyle: { color: 'white' }, right: 0, top: 0 },
            grid: { left: 0, right: 0, top: 40, bottom: 0, containLabel: true },
            xAxis: { type: 'category', data: traffic?.labels || [], axisLabel: { color: 'gray' }, axisTick: { show: false } },
            yAxis: { type: 'value', splitLine: { lineStyle: { color: '#333', type: 'dashed' } }, axisLabel: { color: 'gray' } },
            series: [
                {
                    name: 'Unique Visitors', type: 'line', data: traffic?.visitorsData || [],
                    smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#7c6cfa', width: 2.5 },
                },
                {
                    name: 'Pageviews', type: 'line', data: traffic?.pageviewsData || [],
                    smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#22d3ee', width: 2.5 },
                },
            ],
        }
    }

    function getDonutOption() {
        return {
            backgroundColor: 'transparent',
            series: [{
                type: 'pie', radius: ['55%', '80%'], center: ['50%', '50%'],
                data: topSources.map((s: any) => ({ value: s.visits, name: s.source })),
                label: { show: false }, color: topSources.map((s: any) => s.color),
            }],
        }
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {metrics.map((m: any, i: number) => (
                    <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <MetricCard {...m} />
                    </motion.div>
                ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} >
                <AiInsights />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-semibold text-text-primary">Visitors & Pageviews</h2>
                        <p className="text-xs text-text-muted mt-0.5">ClickHouse Aggregations (Live)</p>
                    </div>
                </div>
                <ReactECharts option={getMainChartOption()} style={{ height: '320px' }} />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Pages */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-border">
                    <h2 className="text-base font-semibold text-text-primary mb-4">Top Pages</h2>
                    <div className="space-y-3">
                        {topPages.map((page: any) => (
                            <div key={page.page} className="grid grid-cols-[1fr,80px] gap-2 items-center">
                                <span className="text-sm text-text-secondary font-mono truncate">{page.page}</span>
                                <span className="text-sm font-medium text-text-primary text-right tabular-nums">{formatNumber(page.views)}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Traffic Sources */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-border">
                    <h2 className="text-base font-semibold text-text-primary mb-4">Traffic Sources</h2>
                    <div className="flex flex-col items-center gap-6">
                        <ReactECharts option={getDonutOption()} style={{ width: 180, height: 180 }} />
                        <div className="w-full space-y-2.5">
                            {topSources.slice(0, 4).map((s: any) => (
                                <div key={s.source} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="text-text-secondary">{s.source}</span>
                                    <span className="text-text-primary font-medium tabular-nums">{formatNumber(s.visits)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Live Stream */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-border p-6 flex flex-col">
                    <h2 className="text-base font-semibold text-text-primary mb-4">Recent Events (Kafka)</h2>
                    <div className="flex-1 overflow-y-auto space-y-3 h-64">
                        {recentEvents?.map((evt: any, i: number) => (
                            <div key={i} className="p-3 rounded-lg bg-bg-elevated border border-border flex items-start gap-3">
                                <div className="mt-0.5 text-brand-400">
                                    {evt.event === '$pageview' ? <Eye className="w-3.5 h-3.5" /> : <MousePointerClick className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-text-primary block">{evt.event}</span>
                                    <span className="text-[11px] text-text-secondary block mt-1 truncate">{evt.user_id} · {evt.path || evt.url || '/'}</span>
                                </div>
                            </div>
                        ))}
                        {(!recentEvents || recentEvents.length === 0) && (
                            <p className="text-sm text-text-muted text-center pt-10">No recent events ingested yet.</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    )
}
