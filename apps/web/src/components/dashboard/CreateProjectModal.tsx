'use client';

import { useState, useTransition } from 'react';
import { Plus, X, Globe, Loader2, CheckCircle2 } from 'lucide-react';
import { createProject } from '@/actions/projects';
import { useRouter } from 'next/navigation';

const TIMEZONES = [
    'UTC', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Dubai',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Australia/Sydney', 'Pacific/Auckland',
];

interface Props {
    onCreated?: (projectId: string, projectName: string) => void;
}

export default function CreateProjectModal({ onCreated }: Props) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [timezone, setTimezone] = useState('UTC');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        startTransition(async () => {
            try {
                const result = await createProject(name, timezone);
                setSuccess(`Project "${result.project.name}" created! API Key: ${result.apiKey}`);
                setName('');
                setTimeout(() => {
                    setOpen(false);
                    setSuccess('');
                    router.refresh();
                    if (onCreated) onCreated(result.project.id, result.project.name);
                }, 2500);
            } catch (err: any) {
                setError(err.message || 'Failed to create project');
            }
        });
    };

    return (
        <>
            {/* Trigger button — matches the sidebar style */}
            <button
                onClick={() => setOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-1.5 mt-1 rounded-lg
                           text-xs text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-colors"
            >
                <Plus className="w-3.5 h-3.5" />
                Add project
            </button>

            {/* Modal Backdrop */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
                    <div className="glass rounded-2xl border border-border shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-text-primary">New Project</h2>
                                    <p className="text-xs text-text-muted">Each project gets a unique API key</p>
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    Website / App Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. My Blog, Company Website"
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    className="w-full h-10 px-3 bg-bg-base border border-border rounded-lg text-sm text-text-primary
                                               focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500
                                               placeholder:text-text-muted transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    Timezone
                                </label>
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full h-10 px-3 bg-bg-base border border-border rounded-lg text-sm text-text-primary
                                               focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                                >
                                    {TIMEZONES.map(tz => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </select>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                    <X className="w-4 h-4 flex-shrink-0" /> {error}
                                </div>
                            )}

                            {success && (
                                <div className="flex items-start gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Project created!</p>
                                        <p className="text-xs mt-0.5 font-mono break-all text-emerald-300">{success.split('API Key: ')[1]}</p>
                                        <p className="text-xs mt-1 text-emerald-400/70">Copy your API key above — you can always find it in Project Settings.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setOpen(false)}
                                    className="flex-1 h-10 rounded-lg border border-border text-sm text-text-secondary hover:bg-bg-elevated transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isPending || !!success}
                                    className="flex-1 h-10 rounded-lg gradient-brand border-0 text-white text-sm font-medium
                                               hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
