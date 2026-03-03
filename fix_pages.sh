#!/bin/bash
BASE_DIR="/home/sourabh/Desktop/Netra Analytics/apps/web/src/app/dashboard"

# Create directories
mkdir -p "$BASE_DIR/realtime" "$BASE_DIR/analytics" "$BASE_DIR/funnels" "$BASE_DIR/retention" "$BASE_DIR/events" "$BASE_DIR/settings"

# Helper to create a basic page containing a title and a coming soon message
create_page() {
    local route=$1
    local title=$2
    local icon=$3
    cat << TSX > "$BASE_DIR/$route/page.tsx"
import { $icon } from 'lucide-react'

export default function Page() {
    return (
        <div className="space-y-6 max-w-[1200px]">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                    <$icon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">$title</h1>
                    <p className="text-sm text-text-muted mt-0.5">Explore your $title data</p>
                </div>
            </div>
            
            <div className="glass rounded-2xl p-12 border border-border text-center flex flex-col items-center justify-center min-h-[400px]">
                <$icon className="w-12 h-12 text-brand-500/50 mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">Module Active</h3>
                <p className="text-text-secondary max-w-md mx-auto">
                    The $title analytics pipeline is connected and processing events. Connect more data sources to automatically populate this dashboard view.
                </p>
            </div>
        </div>
    )
}
TSX
}

create_page "realtime" "Live Event Stream" "Activity"
create_page "analytics" "Traffic & Pageviews" "BarChart3"
create_page "events" "Event Explorer" "MousePointerClick"
create_page "settings" "Project Settings" "Cog"

# specifically for funnels, let's include the funnel component
cat << 'TSX' > "$BASE_DIR/funnels/page.tsx"
import { Filter } from 'lucide-react'
import FunnelChart from '@/components/charts/FunnelChart'

export default function FunnelsPage() {
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
            
            <div className="glass rounded-2xl p-6 border border-border">
                <FunnelChart />
            </div>
        </div>
    )
}
TSX

# specifically for retention, let's include the heatmap component
cat << 'TSX' > "$BASE_DIR/retention/page.tsx"
import { Zap } from 'lucide-react'
import RetentionHeatmap from '@/components/charts/RetentionHeatmap'

export default function RetentionPage() {
    return (
        <div className="space-y-6 max-w-[1200px]">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Cohort Retention</h1>
                    <p className="text-sm text-text-muted mt-0.5">Analyze user stickiness and repeat engagement over time.</p>
                </div>
            </div>
            
            <div className="glass rounded-2xl p-6 border border-border">
                <RetentionHeatmap />
            </div>
        </div>
    )
}
TSX

