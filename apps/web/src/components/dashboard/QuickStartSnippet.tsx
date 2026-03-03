'use client';

import { useState } from 'react';
import { Terminal, Copy, CheckCircle2 } from 'lucide-react';

export default function QuickStartSnippet({ newestKey }: { newestKey: string }) {
    const [copied, setCopied] = useState(false);

    const sdkSnippet = `<!-- Trusanity Analytics SDK -->\n<script defer src="https://cdn.trusanity.com/track.js" data-site-id="${newestKey}"></script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(sdkSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass rounded-xl p-8 border border-border relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <Terminal className="w-6 h-6 text-accent-500" />
                    <h2 className="text-xl font-bold">Quick Start SDK</h2>
                </div>
                <p className="text-text-muted mb-6 max-w-2xl">
                    Copy and paste this snippet into the <code>&lt;head&gt;</code> of your website. It will automatically initialize the autocapture engine using your most recent active API key.
                </p>

                <div className="relative group">
                    <pre className="p-6 rounded-xl bg-bg-base border border-border/50 text-sm font-mono text-emerald-400 overflow-x-auto shadow-inner">
                        {sdkSnippet}
                    </pre>
                    <button
                        onClick={handleCopy}
                        className="absolute top-4 right-4 p-2 bg-surface-muted/50 hover:bg-surface-muted rounded-md border border-border/50 transition-colors backdrop-blur-sm shadow-sm"
                    >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-text-muted" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
