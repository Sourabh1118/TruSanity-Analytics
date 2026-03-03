'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@trusanity/ui';
import { Activity, ArrowUpRight, ShieldCheck, Users, Search, Play, CreditCard, Building2, ServerCrash, RefreshCw } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';

// Helper component for ECharts that handles hydration mismatches
function AdminChart({ option }: { option: any }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="h-[300px] w-full animate-pulse bg-bg-elevated rounded-xl" />;
    return <ReactECharts option={option} theme={resolvedTheme === 'dark' ? 'dark' : 'light'} style={{ height: 300 }} />;
}

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'SUPER_ADMIN')) {
            router.push('/dashboard');
        }
    }, [status, session, router]);

    // Dummy Chart Configurations targeting the SaaS aesthetic
    const revenueOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLine: { lineStyle: { color: resolvedTheme === 'dark' ? '#334155' : '#e2e8f0' } } },
        yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: resolvedTheme === 'dark' ? '#1e293b' : '#f1f5f9' } } },
        series: [{
            name: 'Platform MRR',
            type: 'line',
            smooth: true,
            areaStyle: { opacity: 0.1, color: '#f97316' }, // Orange 500
            lineStyle: { color: '#f97316', width: 3 },
            itemStyle: { color: '#f97316' },
            data: [1200, 1450, 1600, 1900, 2400, 2980, 4200]
        }]
    };

    const volumeOption = {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'], axisLine: { lineStyle: { color: resolvedTheme === 'dark' ? '#334155' : '#e2e8f0' } } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: resolvedTheme === 'dark' ? '#1e293b' : '#f1f5f9' } } },
        series: [{
            name: 'API Calls',
            type: 'bar',
            barWidth: '40%',
            itemStyle: { borderRadius: [4, 4, 0, 0], color: '#3b82f6' }, // Blue Accent
            data: [3200, 1100, 8400, 14200, 10500, 6800, 4100]
        }]
    };

    if (status === 'loading') {
        return <div className="p-8 flex items-center justify-center h-full"><RefreshCw className="w-8 h-8 animate-spin text-brand-500" /></div>;
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-brand-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Platform Overview</h1>
                    </div>
                    <p className="text-text-muted mt-2 ml-14">Global SaaS operations, billing, and tenancy metrics.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="glass hover:bg-bg-elevated border-border"><RefreshCw className="w-4 h-4 mr-2" /> Sync Stripe</Button>
                    <Button className="gradient-brand border-0 shadow-lg shadow-brand-500/20 text-white">Create Tenant</Button>
                </div>
            </div>

            {/* Top-Level KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Building2 className="w-16 h-16 text-brand-500" /></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                        <CardTitle className="text-sm font-medium text-text-muted">Total Organizations</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-3xl font-bold text-text-primary">124</div>
                        <div className="flex items-center mt-1 text-xs text-success font-medium">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> +12% from last month
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><CreditCard className="w-16 h-16 text-purple-500" /></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                        <CardTitle className="text-sm font-medium text-text-muted">Monthly Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-3xl font-bold text-text-primary">$42,500</div>
                        <div className="flex items-center mt-1 text-xs text-success font-medium">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> +$8,200 from last month
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity className="w-16 h-16 text-blue-500" /></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                        <CardTitle className="text-sm font-medium text-text-muted">Ingestion Volume (24h)</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-3xl font-bold text-text-primary">8.4M</div>
                        <div className="flex items-center mt-1 text-xs text-brand-500 font-medium">
                            Avg. 120 req/sec globally
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-500/5 border-red-500/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ServerCrash className="w-16 h-16 text-red-500" /></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                        <CardTitle className="text-sm font-medium text-danger">Rate Limits Hit</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-3xl font-bold text-danger">3</div>
                        <div className="flex items-center mt-1 text-xs text-danger/80 font-medium">
                            Tenants require plan upgrades
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Interactive Charts Area */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">MRR Growth Trajectory</CardTitle>
                        <CardDescription>Estimated recurring revenue across active SaaS plans.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AdminChart option={revenueOption} />
                    </CardContent>
                </Card>
                <Card className="glass border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Global Ingestion Spikes</CardTitle>
                        <CardDescription>Aggregate analytics events captured across all tenants.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AdminChart option={volumeOption} />
                    </CardContent>
                </Card>
            </div>

            {/* Premium Tenants Table */}
            <Card className="glass border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-bg-surface/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Enterprise Organizations</CardTitle>
                            <CardDescription>Top organizations ordered by ingestion volume.</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input type="text" placeholder="Search tenants..." className="w-full h-9 pl-9 pr-4 bg-bg-base border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-text-muted" />
                        </div>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader className="bg-bg-base">
                        <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="font-semibold text-text-secondary">Workspace ID</TableHead>
                            <TableHead className="font-semibold text-text-secondary">Subscription Context</TableHead>
                            <TableHead className="font-semibold text-text-secondary">System Health</TableHead>
                            <TableHead className="font-semibold text-text-secondary">Seat Utilization</TableHead>
                            <TableHead className="text-right font-semibold text-text-secondary">Operations</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="border-border/50 hover:bg-bg-elevated transition-colors cursor-pointer group">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">HQ</div>
                                    <div>
                                        <p className="font-medium text-text-primary">Trusanity Inc</p>
                                        <p className="text-xs text-text-muted font-mono">netra-system-hq</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <Badge className="w-fit bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20">Enterprise Tier</Badge>
                                    <span className="text-xs text-text-muted font-mono flex items-center gap-1"><CreditCard className="w-3 h-3" /> sub_1NkxZ2</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-sm font-medium text-emerald-500">Operational</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-text-muted" />
                                    <span className="font-medium text-text-primary">24 Active</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity glass">Inspect</Button>
                            </TableCell>
                        </TableRow>
                        <TableRow className="border-border/50 hover:bg-bg-elevated transition-colors cursor-pointer group">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold border border-orange-500/30">AC</div>
                                    <div>
                                        <p className="font-medium text-text-primary">Acme Corp Global</p>
                                        <p className="text-xs text-text-muted font-mono">acme-production</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    <Badge className="w-fit bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">Professional</Badge>
                                    <span className="text-xs text-text-muted font-mono flex items-center gap-1"><CreditCard className="w-3 h-3" /> sub_9PqtX4</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                                    <span className="text-sm font-medium text-amber-500">Rate Limited</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-text-muted" />
                                    <span className="font-medium text-text-primary">8 Active</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity glass">Inspect</Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
