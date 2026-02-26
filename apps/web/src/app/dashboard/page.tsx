'use client'

import { motion } from 'framer-motion'
import {
    Activity, ArrowDownRight, ArrowUpRight,
    Clock, Eye, Globe2, MousePointerClick, TrendingUp, Users,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { formatNumber } from '@/lib/utils'

// Lazy load ECharts to avoid SSR issues
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

// ── Sample data ─────────────────────────────────────────
const last7Days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const visitorsData = [3200, 4100, 3800, 5200, 4800, 6100, 5800]
const pageviewsData = [8100, 10200, 9400, 13100, 11900, 15400, 14200]

const topPages = [
    { page: '/', views: 12841, change: 8.2 },
    { page: '/pricing', views: 4102, change: 14.5 },
    { page: '/docs', views: 3891, change: -2.1 },
    { page: '/dashboard', views: 2540, change: 22.3 },
    { page: '/blog/analytics-guide', views: 1920, change: 45.2 },
]

const topSources = [
    { source: 'Direct', visits: 8200, pct: 34, color: '#7c6cfa' },
    { source: 'Google', visits: 7100, pct: 29, color: '#22d3ee' },
    { source: 'Twitter / X', visits: 3800, pct: 16, color: '#a855f7' },
    { source: 'LinkedIn', visits: 2400, pct: 10, color: '#06b6d4' },
    { source: 'GitHub', visits: 1200, pct: 5, color: '#8b5cf6' },
]

const recentEvents = [
    { event: '$pageview', user: 'anon_a1b2', page: '/pricing', time: '2s ago' },
    { event: 'sign_up', user: 'anon_c3d4', page: '/register', time: '14s ago' },
    { event: '$pageview', user: 'anon_e5f6', page: '/', time: '28s ago' },
    { event: 'cta_click', user: 'user_abc', page: '/docs', time: '41s ago' },
    { event: '$pageview', user: 'anon_g7h8', page: '/dashboard', time: '1m ago' },
]

// ── Metric Card ──────────────────────────────────────────
interface MetricCardProps {
    label: string
    value: string | number
    change: number
    icon: React.ElementType
    color: string
}

function MetricCard({ label, value, change, icon: Icon, color }: MetricCardProps) {
    const positive = change >= 0
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
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${positive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                    {positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {Math.abs(change)}%
                </div>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1 tabular-nums">
                {typeof value === 'number' ? formatNumber(value) : value}
            </div>
            <div className="text-sm text-text-muted">{label}</div>
        </motion.div>
    )
}

// ── Main Chart options (ECharts) ─────────────────────────
function getMainChartOption() {
    return {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'oklch(0.16 0.02 264)',
            borderColor: 'oklch(0.25 0.015 264)',
            textStyle: { color: 'oklch(0.96 0.005 264)', fontSize: 12 },
            axisPointer: { type: 'cross', crossStyle: { color: 'oklch(0.35 0.02 264)' } },
        },
        legend: {
            data: ['Unique Visitors', 'Pageviews'],
            textStyle: { color: 'oklch(0.70 0.01 264)', fontSize: 12 },
            right: 0,
            top: 0
        },
        grid: { left: 0, right: 0, top: 40, bottom: 0, containLabel: true },
        xAxis: {
            type: 'category',
            data: last7Days,
            axisLine: { lineStyle: { color: 'oklch(0.25 0.015 264)' } },
            axisLabel: { color: 'oklch(0.50 0.01 264)', fontSize: 11 },
            axisTick: { show: false },
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'oklch(0.20 0.02 264)', type: 'dashed' } },
            axisLabel: { color: 'oklch(0.50 0.01 264)', fontSize: 11, formatter: (v: number) => formatNumber(v) },
        },
        series: [
            {
                name: 'Unique Visitors',
                type: 'line',
                data: visitorsData,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { color: '#7c6cfa', width: 2.5 },
                itemStyle: { color: '#7c6cfa', borderWidth: 2, borderColor: '#1a1a2e' },
                areaStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(124, 108, 250, 0.25)' },
                            { offset: 1, color: 'rgba(124, 108, 250, 0.0)' },
                        ],
                    },
                },
            },
            {
                name: 'Pageviews',
                type: 'line',
                data: pageviewsData,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { color: '#22d3ee', width: 2.5 },
                itemStyle: { color: '#22d3ee', borderWidth: 2, borderColor: '#1a1a2e' },
                areaStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(34, 211, 238, 0.2)' },
                            { offset: 1, color: 'rgba(34, 211, 238, 0.0)' },
                        ],
                    },
                },
            },
        ],
    }
}

// ── Traffic Sources Donut ────────────────────────────────
function getDonutOption() {
    return {
        backgroundColor: 'transparent',
        tooltip: {
            backgroundColor: 'oklch(0.16 0.02 264)',
            borderColor: 'oklch(0.25 0.015 264)',
            textStyle: { color: 'oklch(0.96 0.005 264)', fontSize: 12 },
        },
        series: [{
            type: 'pie',
            radius: ['55%', '80%'],
            center: ['50%', '50%'],
            data: topSources.map((s) => ({ value: s.visits, name: s.source })),
            itemStyle: { borderRadius: 4, borderColor: 'oklch(0.12 0.015 264)', borderWidth: 2 },
            label: { show: false },
            color: topSources.map((s) => s.color),
        }],
    }
}

// ── Page ─────────────────────────────────────────────────
export default function DashboardOverviewPage() {
    const metrics = [
        { label: 'Unique Visitors', value: 24891, change: 12.4, icon: Users, color: 'bg-brand-500/80' },
        { label: 'Total Pageviews', value: 82180, change: 8.7, icon: Eye, color: 'bg-accent-500/80' },
        { label: 'Avg. Session Duration', value: '3m 22s', change: -3.1, icon: Clock, color: 'bg-purple-500/80' },
        { label: 'Events Captured', value: 241800, change: 22.1, icon: MousePointerClick, color: 'bg-orange-500/80' },
        { label: 'Bounce Rate', value: '34.1%', change: -5.2, icon: TrendingUp, color: 'bg-green-500/80' },
        { label: 'Countries Reached', value: 47, change: 6.3, icon: Globe2, color: 'bg-cyan-500/80' },
    ]

    return (
        <div className="space-y-6 max-w-[1400px]">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Overview</h1>
                    <p className="text-sm text-text-muted mt-0.5">Last 7 days · Compared to previous period</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-success font-medium">
                    <Activity className="w-4 h-4" />
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block" />
                    Live data
                </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {metrics.map((m, i) => (
                    <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <MetricCard {...m} />
                    </motion.div>
                ))}
            </div>

            {/* Main chart */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6 border border-border"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-semibold text-text-primary">Visitors & Pageviews</h2>
                        <p className="text-xs text-text-muted mt-0.5">Trend over the last 7 days</p>
                    </div>
                </div>
                <ReactECharts option={getMainChartOption()} style={{ height: '320px' }} />
            </motion.div>

            {/* Bottom row: Top pages + Traffic sources + Recent Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Pages */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-2xl p-6 border border-border"
                >
                    <h2 className="text-base font-semibold text-text-primary mb-4">Top Pages</h2>
                    <div className="space-y-3">
                        <div className="grid grid-cols-[1fr,80px,60px] gap-2 text-xs text-text-muted pb-2 border-b border-border">
                            <span>Page</span>
                            <span className="text-right">Views</span>
                            <span className="text-right">Change</span>
                        </div>
                        {topPages.map((page) => (
                            <div key={page.page} className="grid grid-cols-[1fr,80px,60px] gap-2 items-center">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                                    <span className="text-sm text-text-secondary font-mono truncate">{page.page}</span>
                                </div>
                                <span className="text-sm font-medium text-text-primary text-right tabular-nums">
                                    {formatNumber(page.views)}
                                </span>
                                <span className={`text-xs text-right font-medium ${page.change >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {page.change >= 0 ? '+' : ''}{page.change}%
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Traffic sources */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="glass rounded-2xl p-6 border border-border"
                >
                    <h2 className="text-base font-semibold text-text-primary mb-4">Traffic Sources</h2>
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-full flex justify-center">
                            <ReactECharts option={getDonutOption()} style={{ width: 180, height: 180 }} />
                        </div>
                        <div className="w-full space-y-2.5">
                            {topSources.slice(0, 4).map((s) => (
                                <div key={s.source} className="flex items-center justify-between gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                                        <span className="text-text-secondary">{s.source}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-text-primary font-medium tabular-nums">{formatNumber(s.visits)}</span>
                                        <span className="text-text-muted text-xs w-8 text-right">{s.pct}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Live Event Stream */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-2xl border border-border flex flex-col overflow-hidden relative"
                >
                    <div className="absolute top-0 inset-x-0 h-1 gradient-brand" />
                    <div className="p-6 pb-2 border-b border-border/50">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-base font-semibold text-text-primary">Live Event Feed</h2>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                            </span>
                        </div>
                        <p className="text-xs text-text-muted">Last 50 events in real-time</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {recentEvents.map((evt, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 + 0.5 }}
                                className="p-3 rounded-lg bg-bg-elevated border border-border hover:border-brand-500/30 transition-colors flex items-start gap-3"
                            >
                                <div className={`mt-0.5 p-1.5 rounded bg-bg-surface ${evt.event === '$pageview' ? 'text-brand-400' : 'text-accent-500'}`}>
                                    {evt.event === '$pageview' ? <Eye className="w-3.5 h-3.5" /> : <MousePointerClick className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-xs font-semibold text-text-primary font-mono truncate">{evt.event}</span>
                                        <span className="text-[10px] text-text-muted whitespace-nowrap">{evt.time}</span>
                                    </div>
                                    <div className="text-[11px] text-text-secondary flex items-center gap-1.5">
                                        <span className="truncate max-w-[80px] text-text-muted">{evt.user}</span>
                                        <span>·</span>
                                        <span className="truncate">{evt.page}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
