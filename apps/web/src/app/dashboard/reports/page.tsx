import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getReportSchedules } from '@/actions/reports';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@trusanity/ui';
import ReportManagerClient from '@/components/dashboard/ReportManagerClient';
import { db } from '@/lib/db';
import { apiKeys } from '@netra/db';
import { eq } from 'drizzle-orm';

export const metadata = {
    title: 'Scheduled Reports | Trusanity',
};

export default async function ReportsPage() {
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
    const initialSchedules = await getReportSchedules(projectId);

    return (
        <div className="p-8 space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Scheduled Reports</h1>
                <p className="text-muted-foreground mt-2">
                    Configure automated email reports to receive analytics summaries on a regular basis.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Schedules</CardTitle>
                    <CardDescription>Manage your automated PDF export and summary emails.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportManagerClient projectId={projectId} initialSchedules={initialSchedules} />
                </CardContent>
            </Card>
        </div>
    );
}
