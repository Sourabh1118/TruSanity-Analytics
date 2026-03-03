import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAlerts } from '@/actions/alerts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@trusanity/ui';
import AlertsManagerClient from '@/components/dashboard/AlertsManagerClient';
import { db } from '@/lib/db';
import { apiKeys } from '@netra/db';
import { eq } from 'drizzle-orm';

export const metadata = {
    title: 'Alerts & Anomalies | Trusanity',
};

export default async function AlertsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const activeProject = await db.query.apiKeys.findFirst({
        where: eq(apiKeys.type, 'public'),
        with: { project: true }
    });

    if (!activeProject) {
        return <div className="p-8">Please configure a project first.</div>;
    }

    const projectId = activeProject.projectId;
    const initialAlerts = await getAlerts(projectId);

    return (
        <div className="p-8 space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Anomaly Detection</h1>
                <p className="text-muted-foreground mt-2">
                    Configure threshold triggers to receive notifications when key metrics deviate unexpectedly.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Monitors</CardTitle>
                    <CardDescription>Alerts run dynamically against incoming event streams.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertsManagerClient projectId={projectId} initialAlerts={initialAlerts} />
                </CardContent>
            </Card>
        </div>
    );
}
