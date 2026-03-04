import { getAllTenants } from '@/actions/admin';
import { Building2, Search, SlidersHorizontal, Users, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@trusanity/ui';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AdminTenantsPage() {
    const tenants = await getAllTenants();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Organizations</h1>
                    <p className="text-text-muted mt-2">
                        {tenants.length} tenant{tenants.length !== 1 ? 's' : ''} · All fetched live from PostgreSQL
                    </p>
                </div>
            </div>

            <Card className="glass border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle>Tenant Directory</CardTitle>
                    <CardDescription>All registered SaaS environments with their plan and membership data.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {tenants.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center p-8">
                            <Building2 className="w-12 h-12 text-border mb-4" />
                            <h2 className="text-lg font-semibold text-text-primary">No Tenants Yet</h2>
                            <p className="text-text-muted max-w-sm mt-2">Organizations will appear here once users register on the Storefront.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-text-muted uppercase bg-bg-base border-b border-border/50">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Organization</th>
                                        <th className="px-6 py-3 font-medium">Slug</th>
                                        <th className="px-6 py-3 font-medium">Plan</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium">Members</th>
                                        <th className="px-6 py-3 font-medium">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.map((tenant) => (
                                        <tr key={tenant.id} className="border-b border-border/30 hover:bg-bg-elevated transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs border border-brand-500/30">
                                                        {tenant.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-text-primary">{tenant.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-text-muted">{tenant.slug}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tenant.plan === 'pro' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' :
                                                        tenant.plan === 'enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                            'bg-bg-elevated text-text-muted border-border'
                                                    }`}>{tenant.plan}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`flex h-2 w-2 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    <span className={`text-sm font-medium ${tenant.status === 'active' ? 'text-emerald-500' : 'text-red-400'}`}>{tenant.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-text-primary">
                                                    <Users className="w-3 h-3 text-text-muted" /> {tenant.memberCount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-text-muted text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(tenant.createdAt), { addSuffix: true })}
                                                </div>
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
