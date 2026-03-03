import { BarChart3 } from 'lucide-react'
import { getTopPages, getTopReferrers, getTopBrowsers } from '@/actions/analytics'
import AnalyticsLiveClient from '@/components/dashboard/AnalyticsLiveClient'

export default async function DashboardAnalyticsPage() {
    // 1. Await live ClickHouse aggregations for Demographics
    const topPages = await getTopPages();
    const topReferrers = await getTopReferrers();
    const topBrowsers = await getTopBrowsers();

    return (
        <div className="space-y-6 max-w-[1400px]">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Traffic Demographics</h1>
                    <p className="text-sm text-text-muted mt-0.5">Deep cuts into referrers, devices, and top performing content.</p>
                </div>
            </div>

            <AnalyticsLiveClient
                topPages={topPages || []}
                topReferrers={topReferrers || []}
                topBrowsers={topBrowsers || []}
            />
        </div>
    )
}
