"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@trusanity/ui';
import { Activity } from 'lucide-react';

interface RealTimeEvent {
    id: string; // generated locally for list keys
    event_name: string;
    user_id: string;
    country: string;
    timestamp: string;
}

export default function RealTimeView({ projectId }: { projectId: string }) {
    const [events, setEvents] = useState<RealTimeEvent[]>([]);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [projectId]);

    const connect = () => {
        // Assume API runs on port 3001 locally for this MVP
        const wsUrl = \`ws://localhost:3001/v1/stream?projectId=\${projectId}\`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setStatus('connected');
        };

        ws.onmessage = (message) => {
            try {
                const payload = JSON.parse(message.data);
                if (payload.type === 'INGESTION' && Array.isArray(payload.data)) {
                    const newEvents: RealTimeEvent[] = payload.data.map((evt: any) => ({
                        id: Math.random().toString(36).substring(7),
                        event_name: evt.event_name,
                        user_id: evt.user_id || evt.anonymous_id?.substring(0, 8) || 'Anonymous',
                        country: evt.country || 'Unknown',
                        timestamp: new Date().toLocaleTimeString()
                    }));

                    setEvents(prev => {
                        const next = [...newEvents, ...prev];
                        // Keep only last 50 events in memory
                        return next.slice(0, 50);
                    });
                }
            } catch (e) {
                console.error("WebSocket message parse error", e);
            }
        };

        ws.onclose = () => {
            setStatus('disconnected');
            // Reconnect logic
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };
        
        ws.onerror = () => {
            ws.close();
        }
    };

    return (
        <Card className="col-span-full xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        Live Event Stream
                        {status === 'connected' ? (
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        ) : (
                            <span className="relative flex h-3 w-3">
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Monitoring incoming traffic in real-time bypassing batch pipelines.</p>
                </div>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {events.length === 0 && status === 'connected' && (
                        <div className="h-24 flex items-center justify-center text-sm text-gray-400 border border-dashed rounded-lg">
                            Waiting for live events...
                        </div>
                    )}
                    {events.length === 0 && status !== 'connected' && (
                        <div className="h-24 flex items-center justify-center text-sm text-gray-400 border border-dashed rounded-lg">
                            Connecting to Live Stream Server...
                        </div>
                    )}
                    
                    {events.map((evt) => (
                        <div key={evt.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in slide-in-from-top-2">
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-sm">{evt.event_name}</span>
                                <span className="text-xs text-muted-foreground font-mono">{evt.user_id} • {evt.country}</span>
                            </div>
                            <span className="text-xs text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {evt.timestamp}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
