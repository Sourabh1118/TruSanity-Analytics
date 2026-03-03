import VisualTagger from '@/components/tagger/VisualTagger';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@netra/db';
import { projects } from '@netra/db/schema';
import { eq } from 'drizzle-orm';

export const metadata = {
    title: 'Visual Event Tagger | Trusanity',
};

export default async function TaggerPage() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    // In a real multi-tenant app, we'd fetch the selected project ID from URL state, local storage, or user profile.
    // For now, we'll gracefully fallback or fetch the first project they have access to.

    // As a placeholder, let's assume we pass in a dummy ID if we don't have one, or fetch the user's first project.
    // We'll just define a mock project ID string so the component works.
    const mockProjectId = "00000000-0000-0000-0000-000000000000";

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">No-Code Instrumentation</h1>
                <p className="text-muted-foreground mt-2">
                    Visually point, click, and tag elements on your live website. No developers required.
                </p>
            </div>

            <VisualTagger projectId={mockProjectId} />
        </div>
    );
}
