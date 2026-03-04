import { getAdminStats, getAllTenants } from '@/actions/admin';
import { Building2, CreditCard, Activity, Users, FolderOpen, TrendingUp, ArrowUpRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@trusanity/ui';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const [stats, tenants] = await Promise.all([getAdminStats(), getAllTenants()]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-brand-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Platform Overview</h1>
                    </div>
                    <p className="text-text-muted mt-2 ml-14">Live counts from PostgreSQL · ClickHouse event volume.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/health" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border glass text-sm text-text-secondary hover:bg-bg-elevated transition-colors">
                        <Activity className="w-4 h-4" /> System Health
                    </Link>
                    <Link href="/admin/tenants" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
                        <Building2 className="w-4 h-4" /> All Tenants
                    </Link>
                </div>
            </div>

            {/* Real KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Building2 className="w-16 h-16 text-brand-500" /></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                        <CardTitle className="text-sm font-medium text-text-muted">Total Organizations</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-3xl font-bold text-text-primary">{formatNumber(stats.tenants)}</div>
                        <div className="text-xs text-text-muted mt-1">Registered tenants</div>
                    </CardContent>
                </Card>

                <Card className="glass border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users className="w-16 h-16 text-purple-500" /></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                        <CardTitle className="text-sm font-medium text-text-muted">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-3xl font-bold text-text-primary">{formatNumber(stats.users)}</div>
                        <div className="text-xs text-text-muted mt-1">Across all tenants</div>
                    </CardContent>
                </Card>

                <Card className="glass border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><FolderOpen className="w-16 h-16 text-blue-500" /></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                        <CardTitle className="text-sm font-medium text-text-muted">Active Projects</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-3xl font-bold text-text-primary">{formatNumber(stats.projects)}</div>
                        <div className="text-xs text-text-muted mt-1">Tracked websites</div>
                    </CardContent>
                </Card>

                <Card className="glass border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity className="w-16 h-16 text-cyan-500" /></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                        <CardTitle className="text-sm font-medium text-text-muted">Total Events Captured</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-3xl font-bold text-text-primary">{formatNumber(stats.totalEvents)}</div>
                        <div className="text-xs text-text-muted mt-1">Lifetime ClickHouse count</div>
                    </CardContent>
                </Card>
            </div>

            {/* Real Tenant Table */}
            <Card className="glass border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-bg-surface/50">
                    <CardTitle className="text-lg">Registered Organizations</CardTitle>
                    <CardDescription>All tenants sorted by creation date.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {tenants.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-center">
                            <Building2 className="w-10 h-10 text-border mb-3" />
                            <p className="text-text-muted text-sm">No tenants registered yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-text-muted uppercase bg-bg-base border-b border-border/50">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Organization</th>
                                        <th className="px-6 py-3 font-medium">Plan</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium">Members</th>
                                        <th className="px-6 py-3 font-medium">Subscription</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.map((tenant) => (
                                        <tr key={tenant.id} className="border-b border-border/30 hover:bg-bg-elevated transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold border border-brand-500/30">
                                                        {tenant.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-text-primary">{tenant.name}</p>
                                                        <p className="text-xs text-text-muted font-mono">{tenant.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tenant.plan === 'pro' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' : 'bg-bg-elevated text-text-muted border-border'
                                                    }`}>{tenant.plan}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`flex h-2 w-2 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    <span className={`text-sm font-medium ${tenant.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>{tenant.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-text-primary font-medium">{formatNumber(tenant.memberCount)}</td>
                                            <td className="px-6 py-4 text-text-muted text-xs font-mono">
                                                {tenant.subscription ? tenant.subscription.providerSubscriptionId ?? tenant.subscription.planId : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
