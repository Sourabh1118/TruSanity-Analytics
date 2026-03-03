import { Building2, Search, SlidersHorizontal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@trusanity/ui';

export default function AdminTenantsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Organizations</h1>
                    <p className="text-text-muted mt-2">Manage workspace tenants, subscription features, and member caps.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="glass border-border"><SlidersHorizontal className="w-4 h-4 mr-2" /> Filters</Button>
                    <Button className="gradient-brand border-0 text-white">Provision Tenant</Button>
                </div>
            </div>

            <Card className="glass border-border/50 shadow-sm mt-8">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Tenant Directory</CardTitle>
                            <CardDescription>Comprehensive list of all registered SaaS environments.</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input type="text" placeholder="Search by name, ID, or domain..." className="w-full h-10 pl-10 pr-4 bg-bg-base border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-text-muted" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-96 flex flex-col items-center justify-center text-center">
                    <Building2 className="w-12 h-12 text-border mb-4" />
                    <h2 className="text-lg font-semibold text-text-primary">Full Directory Loading...</h2>
                    <p className="text-text-muted max-w-sm mt-2">Connecting to Platform Postgres to synchronize cross-tenant metadata...</p>
                </CardContent>
            </Card>
        </div>
    );
}
