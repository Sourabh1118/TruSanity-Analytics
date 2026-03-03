interface TrusanityConfig {
    projectId: string;
    apiHost?: string;
    autoTrack?: boolean;
}

class Trusanity {
    private projectId: string;
    private apiHost: string;
    private autoTrack: boolean;
    private sessionId: string;
    private anonymousId: string;
    private queue: any[] = [];
    private flags: Record<string, boolean> = {};
    private isFlushing = false;

    constructor(config: TrusanityConfig) {
        this.projectId = config.projectId;
        this.apiHost = config.apiHost || 'https://api.trusanityanalytics.com';
        this.autoTrack = config.autoTrack !== false;

        this.anonymousId = this.getOrSetAnonymousId();
        this.sessionId = this.getOrSetSessionId();

        if (typeof window !== 'undefined') {
            this.fetchFlags();
        }

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

        // Handle incoming messages from the Trusanity SaaS Dashboard (Visual Tagger Mode)
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'TRUSANITY_ENTER_TAGGING_MODE') {
                this.enableVisualTagger();
            }
        });

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
        let id = localStorage.getItem('trusanity_anon_id');
        if (!id) {
            id = 'anon_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('trusanity_anon_id', id);
        }
        return id;
    }

    private getOrSetSessionId() {
        if (typeof window === 'undefined') return 'server';
        // Simple session state
        let id = sessionStorage.getItem('trusanity_session_id');
        if (!id) {
            id = 'sess_' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('trusanity_session_id', id);
        }
        return id;
    }

    private enableVisualTagger() {
        if (document.getElementById('trusanity-highlighter')) return;

        // Inject the highlighter overlay
        const highlighter = document.createElement('div');
        highlighter.id = 'trusanity-highlighter';
        highlighter.style.position = 'fixed';
        highlighter.style.border = '2px solid rgba(59, 130, 246, 0.8)';
        highlighter.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        highlighter.style.pointerEvents = 'none';
        highlighter.style.zIndex = '999999';
        highlighter.style.transition = 'all 0.1s ease';
        document.body.appendChild(highlighter);

        // Track hovered element
        let currentElement: HTMLElement | null = null;

        const updateHighlighter = (el: HTMLElement) => {
            if (el.id === 'trusanity-highlighter') return;
            const rect = el.getBoundingClientRect();
            highlighter.style.top = `${rect.top}px`;
            highlighter.style.left = `${rect.left}px`;
            highlighter.style.width = `${rect.width}px`;
            highlighter.style.height = `${rect.height}px`;
        };

        const onMouseMove = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target && target !== currentElement) {
                currentElement = target;
                updateHighlighter(target);
            }
        };

        const onClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const target = e.target as HTMLElement;
            if (!target) return;

            const selector = this.generateSelector(target);
            const textContent = target.textContent?.trim().substring(0, 50) || '';

            // Send selection back to dashboard parent iframe
            window.parent.postMessage({
                type: 'TRUSANITY_ELEMENT_SELECTED',
                payload: { selector, textContent, tagName: target.tagName }
            }, '*');
        };

        document.addEventListener('mousemove', onMouseMove, true);
        document.addEventListener('click', onClick, true);

        // Highlight clean up if exited
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'TRUSANITY_EXIT_TAGGING_MODE') {
                document.removeEventListener('mousemove', onMouseMove, true);
                document.removeEventListener('click', onClick, true);
                highlighter.remove();
            }
        });
    }

    private generateSelector(el: HTMLElement): string {
        if (el.tagName.toLowerCase() === 'html') return 'html';

        let path: string[] = [];
        let current: HTMLElement | null = el;

        while (current && current.tagName.toLowerCase() !== 'html') {
            let selector = current.tagName.toLowerCase();
            if (current.id) {
                selector += `#${current.id}`;
                path.unshift(selector);
                break; // IDs are highly unique, safe to stop bubbling
            } else {
                let sibling = current;
                let nth = 1;
                while (sibling.previousElementSibling) {
                    sibling = sibling.previousElementSibling as HTMLElement;
                    if (sibling.tagName.toLowerCase() === selector) nth++;
                }
                if (nth !== 1) selector += `:nth-of-type(${nth})`;
            }
            path.unshift(selector);
        }
        return path.join(' > ');
    }

    private async fetchFlags() {
        try {
            const response = await fetch(`${this.apiHost}/v1/flags?projectId=${this.projectId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                this.flags = data.flags || {};
            }
        } catch (e) {
            console.error("Trusanity SDK: Failed to fetch feature flags", e);
        }
    }

    public evaluateFlag(flagKey: string, defaultValue: boolean = false): boolean {
        if (this.flags.hasOwnProperty(flagKey)) {
            return this.flags[flagKey];
        }
        return defaultValue;
    }
}

let instance: Trusanity | null = null;

export const init = (config: TrusanityConfig) => {
    if (!instance) {
        instance = new Trusanity(config);
    }
    return instance;
};

export const track = (eventName: string, props?: any) => instance?.track(eventName, props);
export const identify = (userId: string, traits?: any) => instance?.identify(userId, traits);
export const evaluateFlag = (flagKey: string, defaultValue: boolean = false): boolean => {
    return instance ? instance.evaluateFlag(flagKey, defaultValue) : defaultValue;
};
