import { Activity } from 'lucide-react'
import { getDashboardKpis, getTrafficOverTime, getRecentEvents } from '@/actions/analytics';
import { getTenantProjects } from '@/actions/projects';
import { formatNumber } from '@/lib/utils';
import QuickStartSnippet from '@/components/dashboard/QuickStartSnippet';
import dynamic from 'next/dynamic'

// Need an interactive Client wrapper for ECharts and animations since Page is now async Server Component
import DashboardLiveClient from '@/components/dashboard/DashboardLiveClient'

export default async function DashboardOverviewPage() {
    // 1. Fetch live aggregations natively via Server Actions against ClickHouse
    const kpis = await getDashboardKpis();
    const traffic = await getTrafficOverTime();
    const recentEvents = await getRecentEvents();

    // 2. Fetch tenant projects to pass latest key to SDK snippet
    const projects = await getTenantProjects();
    const newestKey = projects?.[0]?.apiKeys?.[0]?.id || 'trus_pk_xxxxxxxxxxxxxxxxxxxx';

    // 3. Map Database Results to UI Cards
    const metrics = kpis ? [
        { label: 'Unique Visitors', value: kpis.uniqueVisitors, change: 12.4, icon: 'Users', color: 'bg-brand-500/80' },
        { label: 'Total Pageviews', value: kpis.totalPageviews, change: 8.7, icon: 'Eye', color: 'bg-accent-500/80' },
        { label: 'Avg. Session Duration', value: `${Math.floor(kpis.avgDuration / 60)}m ${kpis.avgDuration % 60}s`, change: -3.1, icon: 'Clock', color: 'bg-purple-500/80' },
        { label: 'Events Captured', value: kpis.totalPageviews * 1.5 /* simplified mock relation */, change: 22.1, icon: 'MousePointerClick', color: 'bg-orange-500/80' },
        { label: 'Bounce Rate', value: '34.1%', change: -5.2, icon: 'TrendingUp', color: 'bg-green-500/80' },
        { label: 'Countries Reached', value: kpis.countriesReached, change: 6.3, icon: 'Globe2', color: 'bg-cyan-500/80' },
    ] : [
        // Fallback zeros if ClickHouse is empty
        { label: 'Unique Visitors', value: 0, change: 0, icon: 'Users', color: 'bg-brand-500/80' },
        { label: 'Total Pageviews', value: 0, change: 0, icon: 'Eye', color: 'bg-accent-500/80' },
        { label: 'Avg. Session Duration', value: '0m 0s', change: 0, icon: 'Clock', color: 'bg-purple-500/80' },
        { label: 'Events Captured', value: 0, change: 0, icon: 'MousePointerClick', color: 'bg-orange-500/80' },
        { label: 'Bounce Rate', value: '0.0%', change: 0, icon: 'TrendingUp', color: 'bg-green-500/80' },
        { label: 'Countries Reached', value: 0, change: 0, icon: 'Globe2', color: 'bg-cyan-500/80' },
    ];

    // Top Sources Donut (Still statically mocked for this iteration)
    const topSources = [
        { source: 'Direct', visits: 8200, pct: 34, color: '#7c6cfa' },
        { source: 'Google', visits: 7100, pct: 29, color: '#22d3ee' },
        { source: 'Twitter / X', visits: 3800, pct: 16, color: '#a855f7' },
        { source: 'LinkedIn', visits: 2400, pct: 10, color: '#06b6d4' },
    ];

    // Top Pages
    const topPages = [
        { page: '/', views: 12841, change: 8.2 },
        { page: '/pricing', views: 4102, change: 14.5 },
        { page: '/docs', views: 3891, change: -2.1 },
        { page: '/dashboard', views: 2540, change: 22.3 },
    ];

    return (
        <div className="space-y-6 max-w-[1400px]">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Overview</h1>
                    <p className="text-sm text-text-muted mt-0.5">Last 7 days · Live ClickHouse Aggregations</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-success font-medium">
                    <Activity className="w-4 h-4" />
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block" />
                    Live data
                </div>
            </div>

            <QuickStartSnippet newestKey={newestKey} />

            {/* Hand off the raw DB payloads to standard React interactive client components to handle ECharts */}
            <DashboardLiveClient
                metrics={metrics}
                traffic={traffic}
                recentEvents={recentEvents}
                topSources={topSources}
                topPages={topPages}
            />
        </div>
    );
}
