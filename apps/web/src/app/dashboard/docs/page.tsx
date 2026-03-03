import { getTenantProjects } from '@/actions/projects';
import ApiDocsClient from './client';

export const dynamic = 'force-dynamic';

export default async function ApiDocsPage() {
    // 1. Fetch tenant's active keys to personalize the documentation snippets
    const projects = await getTenantProjects();
    const newestKey = projects?.[0]?.apiKeys?.[0]?.id || 'trus_pk_xxxxxxxxxxxxxxxxxxxx';

    return <ApiDocsClient newestKey={newestKey} />;
}
