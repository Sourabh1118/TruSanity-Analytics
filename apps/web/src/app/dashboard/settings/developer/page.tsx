import DeveloperSettingsClient from './client';
import { getTenantProjects } from '@/actions/projects';

export const dynamic = 'force-dynamic';

export default async function DeveloperSettingsPage() {
    // Await Drizzle entity resolution on the server
    const projects = await getTenantProjects();

    return <DeveloperSettingsClient initialProjects={projects} />;
}
