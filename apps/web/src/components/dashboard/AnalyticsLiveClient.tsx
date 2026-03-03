'use client'

import { motion } from 'framer-motion'
import { BarChart3, Globe, MonitorSmartphone } from 'lucide-react'
import dynamic from 'next/dynamic'
import { formatNumber } from '@/lib/utils'
import { useTheme } from 'next-themes'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

export default function AnalyticsLiveClient({ topPages, topReferrers, topBrowsers }: any) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || theme === 'system';

    function getDonutOption(data: any[], colorPalette: string[]) {
        return {
            backgroundColor: 'transparent',
            tooltip: {
                backgroundColor: isDark ? 'oklch(0.24 0.02 260)' : 'oklch(0.98 0.01 264)',
                textStyle: { color: isDark ? 'white' : 'black' },
                borderColor: isDark ? 'oklch(0.30 0.015 260)' : 'oklch(0.82 0.02 264)',
            },
            series: [{
                type: 'pie', radius: ['55%', '80%'], center: ['50%', '50%'],
                data: data.map((d: any, i: number) => ({ value: d.count || d.visits || d.hits || d.views, name: d.label || d.source || d.user_agent || d.page })),
                label: { show: false }, color: colorPalette,
            }],
        }
    }

    // High contrast semantic multi-color palette
    const semanticColors = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#a855f7'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Top Referring Domains */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-6">
                    <Globe className="w-5 h-5 text-brand-400" />
                    <h2 className="text-base font-semibold text-text-primary">Top Referring Domains</h2>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <ReactECharts option={getDonutOption(topReferrers, semanticColors)} style={{ width: 220, height: 220 }} />
                    <div className="flex-1 w-full space-y-3">
                        {topReferrers.map((s: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: semanticColors[i % semanticColors.length] }} />
                                    <span className="text-text-secondary truncate max-w-[120px]">{s.source}</span>
                                </div>
                                <span className="text-text-primary font-medium tabular-nums">{formatNumber(s.visits)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Browser Demographics */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-6">
                    <MonitorSmartphone className="w-5 h-5 text-accent-400" />
                    <h2 className="text-base font-semibold text-text-primary">Browser & Devices</h2>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <ReactECharts option={getDonutOption(topBrowsers, [...(semanticColors.slice(1) as string[]), semanticColors[0] as string])} style={{ width: 220, height: 220 }} />
                    <div className="flex-1 w-full space-y-3">
                        {topBrowsers.map((b: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: semanticColors[(i + 1) % semanticColors.length] }} />
                                    <span className="text-text-secondary truncate max-w-[120px]">{b.user_agent}</span>
                                </div>
                                <span className="text-text-primary font-medium tabular-nums">{formatNumber(b.hits)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Expanded Top Pages Table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 border border-border lg:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <h2 className="text-base font-semibold text-text-primary">Detailed Content Performance</h2>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border/50 text-xs text-text-muted">
                            <th className="pb-3 font-medium">Page Path</th>
                            <th className="pb-3 text-right font-medium">Total Pageviews</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {topPages.map((page: any, i: number) => (
                            <tr key={i} className="text-sm hover:bg-bg-surface/30 transition-colors">
                                <td className="py-4 text-text-secondary font-mono">{page.page}</td>
                                <td className="py-4 text-right text-text-primary font-medium tabular-nums">{formatNumber(page.views)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    )
}
