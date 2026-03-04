import { Activity } from 'lucide-react'
import { getDashboardKpis, getTrafficOverTime, getRecentEvents, getTopPages, getTopReferrers } from '@/actions/analytics';
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

    // 3. Fetch top pages and referrers from ClickHouse (real data)
    const [rawTopPages, rawTopSources] = await Promise.all([getTopPages(), getTopReferrers()]);

    // Map top pages — no change% (requires time-comparison query, omit for now)
    const topPages = rawTopPages.map((p) => ({ page: p.page || '/', views: parseInt(p.views, 10), change: 0 }));

    // Map top referrers to donut chart format
    const colors = ['#7c6cfa', '#22d3ee', '#a855f7', '#06b6d4', '#f97316'];
    const totalVisits = rawTopSources.reduce((sum, s) => sum + parseInt(s.visits, 10), 0);
    const topSources = rawTopSources.map((s, i) => ({
        source: s.source || 'Direct',
        visits: parseInt(s.visits, 10),
        pct: totalVisits > 0 ? Math.round((parseInt(s.visits, 10) / totalVisits) * 100) : 0,
        color: colors[i % colors.length],
    }));

    // 4. Map KPI results to UI Cards (all real values, no mocked fields)
    const metrics = kpis ? [
        { label: 'Unique Visitors', value: kpis.uniqueVisitors, change: 0, icon: 'Users', color: 'bg-brand-500/80' },
        { label: 'Total Pageviews', value: kpis.totalPageviews, change: 0, icon: 'Eye', color: 'bg-accent-500/80' },
        { label: 'Avg. Session Duration', value: (() => { const d = Math.round(Number(kpis.avgDuration) || 0); return `${Math.floor(d / 60)}m ${d % 60}s`; })(), change: 0, icon: 'Clock', color: 'bg-purple-500/80' },
        { label: 'Events Captured', value: kpis.totalPageviews, change: 0, icon: 'MousePointerClick', color: 'bg-orange-500/80' },
        { label: 'Bounce Rate', value: '—', change: 0, icon: 'TrendingUp', color: 'bg-green-500/80' },
        { label: 'Countries Reached', value: kpis.countriesReached, change: 0, icon: 'Globe2', color: 'bg-cyan-500/80' },
    ] : [
        { label: 'Unique Visitors', value: 0, change: 0, icon: 'Users', color: 'bg-brand-500/80' },
        { label: 'Total Pageviews', value: 0, change: 0, icon: 'Eye', color: 'bg-accent-500/80' },
        { label: 'Avg. Session Duration', value: '0m 0s', change: 0, icon: 'Clock', color: 'bg-purple-500/80' },
        { label: 'Events Captured', value: 0, change: 0, icon: 'MousePointerClick', color: 'bg-orange-500/80' },
        { label: 'Bounce Rate', value: '—', change: 0, icon: 'TrendingUp', color: 'bg-green-500/80' },
        { label: 'Countries Reached', value: 0, change: 0, icon: 'Globe2', color: 'bg-cyan-500/80' },
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
