import { CreditCard, DollarSign, Download, ArrowUpRight, ShieldCheck, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@trusanity/ui';
import { getGlobalBillingStats, getRecentBillingEvents } from '@/actions/admin';
import { formatNumber } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminBillingPage() {
    const stats = await getGlobalBillingStats();
    const recentEvents = await getRecentBillingEvents(15);

    const getProviderColor = (provider: string) => {
        switch (provider) {
            case 'stripe': return 'bg-brand-500/10 text-brand-500 border-brand-500/20';
            case 'razorpay': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            case 'paypal': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
            case 'payu': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-surface-muted text-text-muted border-border';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Global Billing</h1>
                    <p className="text-text-muted mt-2">Manage Omni-Gateway subscriptions, track MRR, and review historical invoices across all tenants.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="glass border-border"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
                    <Button className="gradient-brand border-0 text-white"><ShieldCheck className="w-4 h-4 mr-2" /> Force Gateway Sync</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mt-8">
                <Card className="glass border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-text-muted">Total Active MRR</CardTitle>
                        <DollarSign className="w-4 h-4 text-brand-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-primary">${formatNumber(stats.mrr)}.00</div>
                        <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> Multi-Gateway Tally
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-text-muted">Active Subscriptions</CardTitle>
                        <CreditCard className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-text-primary">{stats.activeSubscriptions}</div>
                        <p className="text-xs text-text-muted mt-1">
                            Fully provisioned Pro tier tenants
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-text-muted">Overdue Payments</CardTitle>
                        <CreditCard className="w-4 h-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500 border-l-2 border-red-500 pl-2">{stats.overduePayments}</div>
                        <p className="text-xs text-red-400 mt-1">
                            Requires active dunning operations
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle>Recent Cross-Gateway Transactions</CardTitle>
                    <CardDescription>A live multiplexed audit log of all incoming Webhook events from Stripe, Razorpay, PayPal, and PayU.</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentEvents.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center">
                            <FileText className="w-12 h-12 text-border mb-4" />
                            <h2 className="text-lg font-semibold text-text-primary">No Webhook Activity Detected</h2>
                            <p className="text-text-muted max-w-sm mt-2">The 4 webhook endpoints are live, but no incoming payload events exist in the database yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-text-muted uppercase bg-surface-muted/50 border-b border-border/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 rounded-tl-lg font-medium">Tenant</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Gateway Provider</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Webhook Event Type</th>
                                        <th scope="col" className="px-6 py-3 rounded-tr-lg font-medium text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentEvents.map((event) => (
                                        <tr key={event.id} className="border-b border-border/30 hover:bg-surface-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-text-primary">
                                                {event.tenantName}
                                                <span className="text-xs text-text-muted ml-2 font-mono">({event.tenantSlug})</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getProviderColor(event.provider)}`}>
                                                    {event.provider.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-text-muted">
                                                {event.eventType}
                                            </td>
                                            <td className="px-6 py-4 text-right text-text-muted whitespace-nowrap">
                                                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
