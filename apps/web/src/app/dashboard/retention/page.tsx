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
