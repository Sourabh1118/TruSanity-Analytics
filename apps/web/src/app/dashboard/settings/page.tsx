import { Cog } from 'lucide-react'

export default function Page() {
    return (
        <div className="space-y-6 max-w-[1200px]">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                    <Cog className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Project Settings</h1>
                    <p className="text-sm text-text-muted mt-0.5">Explore your Project Settings data</p>
                </div>
            </div>
            
            <div className="glass rounded-2xl p-12 border border-border text-center flex flex-col items-center justify-center min-h-[400px]">
                <Cog className="w-12 h-12 text-brand-500/50 mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">Module Active</h3>
                <p className="text-text-secondary max-w-md mx-auto">
                    The Project Settings analytics pipeline is connected and processing events. Connect more data sources to automatically populate this dashboard view.
                </p>
            </div>
        </div>
    )
}
