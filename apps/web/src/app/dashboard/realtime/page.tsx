'use client'

import { Activity, Eye, MousePointerClick, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getRecentEvents } from '@/actions/analytics'

export default function RealtimePage() {
    const [events, setEvents] = useState<any[]>([])
    const [isPolling, setIsPolling] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const pollData = async () => {
            if (!isPolling) return;
            try {
                // Fetch the absolute newest 15 events from the ClickHouse table via Server Action
                const freshEvents = await getRecentEvents();
                // To avoid React layout thrashing, we set the array directly if it changed
                setEvents((prev) => {
                    // Extremely simple diffing logic - in production use a stronger hash
                    const changed = JSON.stringify(prev) !== JSON.stringify(freshEvents);
                    if (changed) setLastUpdated(new Date());
                    return changed ? freshEvents : prev;
                });
            } catch (e) {
                console.error("Live Ticker Polling Error:", e);
            }
        };

        // Initial fetch
        pollData();

        // 3 second aggressive polling to simulate a WebSocket stream
        if (isPolling) {
            interval = setInterval(pollData, 3000);
        }

        return () => clearInterval(interval);
    }, [isPolling]);

    return (
        <div className="space-y-6 max-w-[1200px]">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/20">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Live Data Stream</h1>
                        <p className="text-sm text-text-muted mt-0.5">Watching Apache Kafka → ClickHouse ingestion in real-time.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-xs text-text-muted font-mono">
                        Last sync: {lastUpdated.toLocaleTimeString()}
                    </div>
                    <button
                        onClick={() => setIsPolling(!isPolling)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${isPolling
                                ? 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                                : 'bg-bg-surface text-text-muted border-border hover:bg-bg-elevated'
                            }`}
                    >
                        {isPolling ? (
                            <><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span></span> Live Ticker Active</>
                        ) : (
                            <><Zap className="w-3.5 h-3.5" /> Paused</>
                        )}
                    </button>
                </div>
            </div>

            <div className="glass rounded-2xl border border-border p-6 min-h-[500px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 gradient-brand" />

                <div className="flex-1 overflow-y-auto space-y-3">
                    <AnimatePresence>
                        {events.map((evt, i) => (
                            <motion.div
                                key={`${evt.timestamp}-${evt.user_id}-${i}`}
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="p-4 rounded-xl bg-bg-surface/50 border border-border hover:border-brand-500/30 transition-colors flex items-center gap-4 group"
                            >
                                <div className={`p-2.5 rounded-lg shrink-0 transition-transform group-hover:scale-110 ${evt.event === '$pageview' ? 'bg-brand-500/10 text-brand-400' : 'bg-accent-500/10 text-accent-400'}`}>
                                    {evt.event === '$pageview' ? <Eye className="w-5 h-5" /> : <MousePointerClick className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-text-primary uppercase tracking-wider">{evt.event}</span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-bg-elevated text-text-muted border border-border">
                                                {evt.user_id?.substring(0, 16)}...
                                            </span>
                                        </div>
                                        <div className="text-xs text-text-secondary font-mono">
                                            Path: <span className="text-brand-300">{evt.path || '/'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-mono text-text-muted">{evt.timestamp}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {events.length === 0 && isPolling && (
                        <div className="h-full flex flex-col items-center justify-center text-text-muted pt-20">
                            <Activity className="w-8 h-8 mb-4 opacity-50 animate-pulse" />
                            <p>Waiting for events to arrive...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
