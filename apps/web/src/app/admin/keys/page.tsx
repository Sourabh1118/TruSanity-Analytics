import { Key, Shield, Plus, Copy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@trusanity/ui';

export default function AdminKeysPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Platform API Keys</h1>
                    <p className="text-text-muted mt-2">Generate and distribute global API keys for internal admin integrations and server-side automation.</p>
                </div>
                <div className="flex gap-4">
                    <Button className="gradient-brand border-0 text-white"><Plus className="w-4 h-4 mr-2" /> Generate Key</Button>
                </div>
            </div>

            <Card className="glass border-border/50 shadow-sm mt-8">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-brand-500" />
                        <CardTitle>Root Access Tokens</CardTitle>
                    </div>
                    <CardDescription>These keys bypass tenant isolation and have unrestricted read/write capabilities across the platform databases.</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex flex-col items-center justify-center text-center">
                    <Key className="w-12 h-12 text-border mb-4" />
                    <h2 className="text-lg font-semibold text-text-primary">No Root Keys Generated</h2>
                    <p className="text-text-muted max-w-sm mt-2">You currently have no automated services accessing the global Drizzle APIs.</p>
                </CardContent>
            </Card>
        </div>
    );
}
