import { Activity, Server, Database, Globe, RefreshCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@trusanity/ui';

export const dynamic = 'force-dynamic';

export default function AdminHealthPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">System Health</h1>
                    <p className="text-text-muted mt-2">Monitor global ingestion pipelines, Kafka brokers, and ClickHouse cluster nodes.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="glass border-border"><RefreshCcw className="w-4 h-4 mr-2" /> Ping Servers</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-8">
                <Card className="glass border-emerald-500/20 shadow-lg shadow-emerald-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Server className="w-16 h-16 text-emerald-500" /></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                        <CardTitle className="text-sm font-medium text-emerald-500">Fastify Ingestion Cluster</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-2xl font-bold text-text-primary">Operational</div>
                        <p className="text-xs text-text-muted mt-1 flex justify-between">
                            <span>Latency: 42ms</span>
                            <span>Throughput: ~1,200 req/s</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass border-emerald-500/20 shadow-lg shadow-emerald-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Database className="w-16 h-16 text-emerald-500" /></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                        <CardTitle className="text-sm font-medium text-emerald-500">ClickHouse OLAP Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-2xl font-bold text-text-primary">Operational</div>
                        <p className="text-xs text-text-muted mt-1 flex justify-between">
                            <span>Nodes: 3 Active</span>
                            <span>Disk IO: 124 MB/s</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass border-amber-500/20 shadow-lg shadow-amber-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-16 h-16 text-amber-500" /></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                        <CardTitle className="text-sm font-medium text-amber-500">Apache Kafka Queue</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-2xl font-bold text-amber-400">Degraded (Lag)</div>
                        <p className="text-xs text-text-muted mt-1 flex justify-between">
                            <span>Topic: netra.events</span>
                            <span className="text-amber-500 font-bold">Lag: 4,028 msgs</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass border-emerald-500/20 shadow-lg shadow-emerald-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Globe className="w-16 h-16 text-emerald-500" /></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                        <CardTitle className="text-sm font-medium text-emerald-500">Redis Configuration Cache</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-2xl font-bold text-text-primary">Operational</div>
                        <p className="text-xs text-text-muted mt-1 flex justify-between">
                            <span>Memory: 1.2 GB / 4.0 GB</span>
                            <span>Evictions: 0</span>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
