'use client';

import { useState, useTransition } from 'react';
import { Key, Plus, Copy, CheckCircle2, Terminal } from 'lucide-react';
import { generateApiKey } from '@/actions/projects';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import QuickStartSnippet from '@/components/dashboard/QuickStartSnippet';

type ApiKey = {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
};

type Project = {
    id: string;
    name: string;
    apiKeys: ApiKey[];
};

export default function DeveloperSettingsClient({ initialProjects }: { initialProjects: Project[] }) {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
    const [isPending, startTransition] = useTransition();
    const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

    const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];
    const newestKey = activeProject?.apiKeys[0]?.id || 'trus_pk_xxxxxxxxxxxxxxxxxxxx';

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKeyId(id);
        setTimeout(() => setCopiedKeyId(null), 2000);
    };

    const handleCreateKey = () => {
        if (!newKeyName || !selectedProjectId) return;

        startTransition(async () => {
            try {
                const newKeyString = await generateApiKey(selectedProjectId, newKeyName);

                // Optimistically update UI
                setProjects(prev => prev.map(p => {
                    if (p.id === selectedProjectId) {
                        return {
                            ...p,
                            apiKeys: [{
                                id: newKeyString,
                                name: newKeyName,
                                isActive: true,
                                createdAt: new Date()
                            }, ...p.apiKeys]
                        };
                    }
                    return p;
                }));

                setIsCreatingKey(false);
                setNewKeyName('');
            } catch (error) {
                console.error("Failed to generate key", error);
                alert("Failed to generate API Key.");
            }
        });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-24 border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-brand tracking-tight mb-1">Developer Settings</h1>
                    <p className="text-text-muted">Manage your API keys and SDK integration snippets.</p>
                </div>
                <button
                    onClick={() => setIsCreatingKey(true)}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate New Key
                </button>
            </div>

            {/* Quick Start Card */}
            <QuickStartSnippet newestKey={newestKey} />

            {/* API Keys Table */}
            <h2 className="text-xl font-bold font-brand pt-4">Active API Keys</h2>

            <div className="glass rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-text-muted uppercase bg-surface-muted/50 border-b border-border/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-medium">Name</th>
                            <th scope="col" className="px-6 py-4 font-medium">Key Token</th>
                            <th scope="col" className="px-6 py-4 font-medium">Status</th>
                            <th scope="col" className="px-6 py-4 font-medium text-right">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeProject?.apiKeys.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                                    No API keys generated yet. Click "Generate New Key" to get started.
                                </td>
                            </tr>
                        ) : (
                            activeProject?.apiKeys.map((key) => (
                                <tr key={key.id} className="border-b border-border/30 hover:bg-surface-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-text-primary">
                                        {key.name}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-text-muted flex items-center gap-3">
                                        ••••••••••••••••••••••••••••{key.id.slice(-8)}
                                        <button
                                            onClick={() => handleCopy(key.id, key.id)}
                                            className="text-brand-500 hover:text-brand-400 transition-colors"
                                            title="Copy full key"
                                        >
                                            {copiedKeyId === key.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${key.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {key.isActive ? 'Active' : 'Revoked'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-text-muted whitespace-nowrap">
                                        {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Key Modal */}
            <AnimatePresence>
                {isCreatingKey && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-bg-base/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl"
                        >
                            <h3 className="text-xl font-bold mb-2">Generate New Key</h3>
                            <p className="text-sm text-text-muted mb-6">Create a new public API key for your frontend integrations.</p>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-1">Key Name</label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="e.g. Production Frontend"
                                        className="w-full bg-bg-base border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsCreatingKey(false)}
                                    className="flex-1 btn-secondary py-2 text-sm"
                                    disabled={isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateKey}
                                    className={`flex-1 btn-primary py-2 text-sm ${(isPending || !newKeyName) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isPending || !newKeyName}
                                >
                                    {isPending ? 'Generating...' : 'Create Key'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
