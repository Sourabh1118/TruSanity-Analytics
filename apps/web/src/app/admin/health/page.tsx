import { getSystemHealth } from '@/actions/admin';
import { Activity, Server, Database, Globe, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@trusanity/ui';

export const dynamic = 'force-dynamic';

export default async function AdminHealthPage() {
    const health = await getSystemHealth();

    const StatusBadge = ({ ok }: { ok: boolean }) => ok
        ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        : <XCircle className="w-5 h-5 text-red-500" />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-primary">System Health</h1>
                <p className="text-text-muted mt-2">Live status of all infrastructure services. Refreshes on each page load.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* PostgreSQL */}
                <Card className={`glass border-${health.postgresStatus === 'ok' ? 'emerald' : 'red'}-500/20 shadow-sm`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                            <Database className="w-5 h-5 text-text-muted" />
                            <CardTitle className="text-sm font-medium text-text-secondary">PostgreSQL (Analytics DB)</CardTitle>
                        </div>
                        <StatusBadge ok={health.postgresStatus === 'ok'} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${health.postgresStatus === 'ok' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {health.postgresStatus === 'ok' ? 'Operational' : 'Unreachable'}
                        </div>
                        <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Query latency: {health.postgresStatus === 'ok' ? `${health.postgresLatencyMs}ms` : 'N/A'}
                        </p>
                    </CardContent>
                </Card>

                {/* ClickHouse */}
                <Card className={`glass border-${health.clickhouseStatus === 'ok' ? 'emerald' : 'red'}-500/20 shadow-sm`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-text-muted" />
                            <CardTitle className="text-sm font-medium text-text-secondary">ClickHouse OLAP</CardTitle>
                        </div>
                        <StatusBadge ok={health.clickhouseStatus === 'ok'} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${health.clickhouseStatus === 'ok' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {health.clickhouseStatus === 'ok' ? 'Operational' : 'Unreachable'}
                        </div>
                        <p className="text-xs text-text-muted mt-1 flex justify-between">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {health.clickhouseStatus === 'ok' ? `${health.clickhouseLatencyMs}ms` : 'N/A'}</span>
                            <span>Total events: {health.clickhouseEvents.toLocaleString()}</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Kafka - status unknown without broker API */}
                <Card className="glass border-border/30 shadow-sm opacity-70">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                            <Server className="w-5 h-5 text-text-muted" />
                            <CardTitle className="text-sm font-medium text-text-secondary">Apache Kafka</CardTitle>
                        </div>
                        <span className="text-xs text-text-muted border border-border rounded px-2 py-0.5">Monitoring N/A</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-muted">Unknown</div>
                        <p className="text-xs text-text-muted mt-1">Broker health requires Kafka JMX/REST API configuration.</p>
                    </CardContent>
                </Card>

                {/* Redis - status unknown without direct ping */}
                <Card className="glass border-border/30 shadow-sm opacity-70">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-text-muted" />
                            <CardTitle className="text-sm font-medium text-text-secondary">Redis Cache</CardTitle>
                        </div>
                        <span className="text-xs text-text-muted border border-border rounded px-2 py-0.5">Monitoring N/A</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-muted">Unknown</div>
                        <p className="text-xs text-text-muted mt-1">Redis health check not yet wired to the web container.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
