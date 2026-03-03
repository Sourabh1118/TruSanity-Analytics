import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getFeatureFlags } from '@/actions/flags';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@trusanity/ui';
import FlagManagerClient from '@/components/dashboard/FlagManagerClient';
import { db } from '@/lib/db';
import { apiKeys } from '@netra/db';
import { eq } from 'drizzle-orm';

export const metadata = {
    title: 'Feature Flags | Trusanity',
};

export default async function FeatureFlagsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    // Assume user is attached to exactly one project for MVP
    const activeProject = await db.query.apiKeys.findFirst({
        where: eq(apiKeys.type, 'public'),
        with: { project: true }
    });

    if (!activeProject) {
        return <div className="p-8">Please configure a project first.</div>;
    }

    const projectId = activeProject.projectId;
    const initialFlags = await getFeatureFlags(projectId);

    return (
        <div className="p-8 space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Feature Flags & A/B Tests</h1>
                <p className="text-muted-foreground mt-2">
                    Control feature rollouts remotely and measure engagement statistically without redeploying code.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Experiments</CardTitle>
                    <CardDescription>Flags created here can be evaluated centrally through the Web SDK.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FlagManagerClient projectId={projectId} initialFlags={initialFlags} />
                </CardContent>
            </Card>
        </div>
    );
}
