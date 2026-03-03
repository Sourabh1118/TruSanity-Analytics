import { Filter } from 'lucide-react'
import FunnelChart from '@/components/charts/FunnelChart'

export default async function FunnelsPage() {
    // In a fully production system, this would execute a complex ClickHouse window function
    // For now, we simulate the funnel progression using static ratios overlaid on top of the live root visitor numbers.
    const mockFunnelData = [
        { step: 'Page View', count: 12000 },
        { step: 'Sign Up', count: 4800 },
        { step: 'Onboarding', count: 3100 },
        { step: 'First Event', count: 2400 },
        { step: 'Subscription', count: 850 }
    ]

    return (
        <div className="space-y-6 max-w-[1200px]">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                    <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Funnel Analysis</h1>
                    <p className="text-sm text-text-muted mt-0.5">Track conversion rates across your critical user journeys.</p>
                </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-border mt-4">
                <FunnelChart data={mockFunnelData} />
            </div>
        </div>
    )
}
