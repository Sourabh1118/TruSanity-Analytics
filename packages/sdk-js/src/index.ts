interface NetraConfig {
    projectId: string;
    apiHost?: string;
    autoTrack?: boolean;
}

class Netra {
    private projectId: string;
    private apiHost: string;
    private autoTrack: boolean;
    private sessionId: string;
    private anonymousId: string;
    private queue: any[] = [];
    private isFlushing = false;

    constructor(config: NetraConfig) {
        this.projectId = config.projectId;
        this.apiHost = config.apiHost || 'https://api.netraanalytics.com';
        this.autoTrack = config.autoTrack !== false;

        this.anonymousId = this.getOrSetAnonymousId();
        this.sessionId = this.getOrSetSessionId();

        if (this.autoTrack && typeof window !== 'undefined') {
            this.initAutoTracking();
        }
    }

    public track(eventName: string, properties: Record<string, any> = {}) {
        if (typeof window === 'undefined') return;

        this.queue.push({
            name: eventName,
            timestamp: new Date().toISOString(),
            session_id: this.sessionId,
            anonymous_id: this.anonymousId,
            url: window.location.href,
            path: window.location.pathname,
            referrer: document.referrer,
            properties
        });

        this.scheduleFlush();
    }

    public identify(userId: string, traits: Record<string, any> = {}) {
        this.track('$identify', { user_id: userId, ...traits });
        // In a real SDK, we'd persist the user_id locally
    }

    private initAutoTracking() {
        this.track('$pageview', { title: document.title });

        // Track page views on SPA route changes
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                this.track('$pageview', { title: document.title });
            }
        }).observe(document, { subtree: true, childList: true });

        // Autocapture clicks
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
                const el = target.closest('button') || target.closest('a') || target;
                this.track('$click', {
                    tag: el.tagName.toLowerCase(),
                    text: el.textContent?.substring(0, 50).trim(),
                    id: el.id,
                    class: el.className,
                    href: (el as HTMLAnchorElement).href
                });
            }
        });

        // Handle session time / heartbeat
        window.addEventListener('beforeunload', () => this.flush(true));
    }

    private async flush(sync = false) {
        if (this.queue.length === 0 || this.isFlushing) return;
        this.isFlushing = true;

        const events = [...this.queue];
        this.queue = [];

        const payload = {
            projectId: this.projectId,
            events
        };

        try {
            if (sync && navigator.sendBeacon) {
                navigator.sendBeacon(`${this.apiHost}/v1/ingest`, JSON.stringify(payload));
            } else {
                await fetch(`${this.apiHost}/v1/ingest`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
        } catch (err) {
            // If failed, put back in queue for next time
            this.queue = [...events, ...this.queue];
        } finally {
            this.isFlushing = false;
        }
    }

    private scheduleFlush() {
        if (typeof window === 'undefined') return;
        // Flush immediately if > 10 items, else wait a bit
        if (this.queue.length > 10) {
            this.flush();
        } else {
            setTimeout(() => this.flush(), 2000);
        }
    }

    private getOrSetAnonymousId() {
        if (typeof window === 'undefined') return 'server';
        let id = localStorage.getItem('netra_anon_id');
        if (!id) {
            id = 'anon_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('netra_anon_id', id);
        }
        return id;
    }

    private getOrSetSessionId() {
        if (typeof window === 'undefined') return 'server';
        // Simple session state
        let id = sessionStorage.getItem('netra_session_id');
        if (!id) {
            id = 'sess_' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('netra_session_id', id);
        }
        return id;
    }
}

let instance: Netra | null = null;

export const init = (config: NetraConfig) => {
    if (!instance) {
        instance = new Netra(config);
    }
    return instance;
};

export const track = (eventName: string, props?: any) => instance?.track(eventName, props);
export const identify = (userId: string, traits?: any) => instance?.identify(userId, traits);
