import DeveloperSettingsClient from './client';
import { getTenantProjects } from '@/actions/projects';
import { getActiveTenantIdOrProvision } from '@/actions/provisioning';

export const dynamic = 'force-dynamic';

export default async function DeveloperSettingsPage() {
    // Await Drizzle entity resolution on the server
    const projects = await getTenantProjects();
    const tenantId = await getActiveTenantIdOrProvision();

    return <DeveloperSettingsClient initialProjects={projects} tenantId={tenantId} />;
}
