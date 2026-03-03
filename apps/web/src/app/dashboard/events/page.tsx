import { MousePointerClick, Calendar, User, Eye, Terminal } from 'lucide-react'
import { getEventsTable } from '@/actions/analytics'

export default async function EventsPage() {
    // 1. Await real ClickHouse table dump
    const rawEvents = await getEventsTable(100);

    return (
        <div className="space-y-6 max-w-[1400px]">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
                    <MousePointerClick className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Event Explorer</h1>
                    <p className="text-sm text-text-muted mt-0.5">Raw unstructured data streaming directly from the OLAP Database.</p>
                </div>
            </div>

            <div className="glass rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-elevated border-b border-border text-xs text-text-muted font-medium">
                                <th className="p-4 pl-6 font-semibold w-[200px]"><div className="flex items-center gap-2"><MousePointerClick className="w-3.5 h-3.5" /> Event Name</div></th>
                                <th className="p-4 font-semibold w-[180px]"><div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Timestamp</div></th>
                                <th className="p-4 font-semibold w-[160px]"><div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> Anonymous ID</div></th>
                                <th className="p-4 pr-6 font-semibold"><div className="flex items-center gap-2"><Terminal className="w-3.5 h-3.5" /> Processed JSON Properties</div></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-sm">
                            {rawEvents?.map((evt: any, i: number) => {
                                const parsed = evt.properties ? JSON.parse(evt.properties) : {};
                                const isPageView = evt.event === '$pageview';

                                return (
                                    <tr key={i} className="hover:bg-bg-surface/50 transition-colors">
                                        <td className="p-4 pl-6">
                                            <span className={`inline-flex items-center gap-1.5 font-mono px-2.5 py-1 rounded-md text-xs font-semibold ${isPageView ? 'bg-brand-500/10 text-brand-400' : 'bg-accent-500/10 text-accent-400'}`}>
                                                {isPageView ? <Eye className="w-3 h-3" /> : <MousePointerClick className="w-3 h-3" />}
                                                {evt.event}
                                            </span>
                                        </td>
                                        <td className="p-4 text-text-secondary whitespace-nowrap">
                                            {evt.timestamp}
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-xs text-text-muted bg-bg-surface px-2 py-1 rounded border border-border">
                                                {evt.user_id?.substring(0, 12)}...
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-text-secondary text-xs font-mono max-w-md truncate">
                                            {Object.entries(parsed).map(([k, v]: any) => (
                                                <span key={k} className="mr-3 inline-block">
                                                    <span className="text-gray-500">{k}:</span> <span className="text-gray-300">"{v}"</span>
                                                </span>
                                            ))}
                                            {Object.keys(parsed).length === 0 && <span className="text-text-muted italic">No properties passed</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {(!rawEvents || rawEvents.length === 0) && (
                    <div className="p-16 text-center text-text-muted">
                        <Terminal className="w-8 h-8 text-border-strong mx-auto mb-3" />
                        <p>No raw events found in ClickHouse for this tenant.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
