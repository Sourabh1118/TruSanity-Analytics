import { Settings, Save, Mail, Globe, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@trusanity/ui';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Global Settings</h1>
                    <p className="text-text-muted mt-2">Configure platform-wide defaults, SMTP mailers, and infrastructure webhooks.</p>
                </div>
            </div>

            <div className="grid gap-6 mt-8">
                {/* General Configuration */}
                <Card className="glass border-border/50 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-brand-500" />
                            <CardTitle>Platform Identity</CardTitle>
                        </div>
                        <CardDescription>Public-facing details represented in emails and storefront links.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-text-primary">Platform Name</label>
                            <input type="text" defaultValue="Trusanity" className="w-full h-10 px-3 bg-bg-base border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-text-primary">Support Contact Email</label>
                            <input type="email" defaultValue="support@netra.com" className="w-full h-10 px-3 bg-bg-base border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" />
                        </div>
                        <Button className="mt-2 glass hover:bg-bg-elevated"><Save className="w-4 h-4 mr-2" /> Save Identity</Button>
                    </CardContent>
                </Card>

                {/* Email Services */}
                <Card className="glass border-border/50 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-purple-500" />
                            <CardTitle>SMTP Mail Relay</CardTitle>
                        </div>
                        <CardDescription>Configuration for transactional delivery (Password resets, tenant invitations).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-text-primary">SMTP Host</label>
                                <input type="text" placeholder="smtp.sendgrid.net" className="w-full h-10 px-3 bg-bg-base border border-border rounded-lg text-sm focus:outline-none transition-all placeholder:text-text-muted" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-text-primary">SMTP Port</label>
                                <input type="number" placeholder="587" className="w-full h-10 px-3 bg-bg-base border border-border rounded-lg text-sm focus:outline-none transition-all placeholder:text-text-muted" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                                SMTP Password <Lock className="w-3 h-3 text-text-muted" />
                            </label>
                            <input type="password" placeholder="••••••••••••••••" className="w-full h-10 px-3 bg-bg-base border border-border rounded-lg text-sm focus:outline-none transition-all placeholder:text-text-muted" />
                        </div>
                        <Button className="mt-2 glass hover:bg-bg-elevated"><Save className="w-4 h-4 mr-2" /> Update Provider</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
