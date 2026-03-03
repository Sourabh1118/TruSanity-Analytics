import { AppState, AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TrusanityConfig {
    projectId: string;
    apiHost?: string;
    autoTrackSessions?: boolean;
}

const STORAGE_KEY = '@trusanity_events_queue';
const SESSION_KEY = '@trusanity_session_id';
const ANON_KEY = '@trusanity_anon_id';

class Trusanity {
    private projectId: string;
    private apiHost: string;
    private sessionId: string | null = null;
    private anonymousId: string | null = null;
    private queue: any[] = [];
    private isFlushing = false;
    private appState: AppStateStatus = AppState.currentState;

    constructor(config: TrusanityConfig) {
        this.projectId = config.projectId;
        this.apiHost = config.apiHost || 'https://api.trusanityanalytics.com';

        // Initialize async properties
        this.initStorage().then(() => {
            if (config.autoTrackSessions !== false) {
                this.initLifecycleTracking();
                this.track('$session_start', { os: Platform.OS, platform: 'react_native' });
            }
        });
    }

    private async initStorage() {
        // Load IDs
        let anonId = await AsyncStorage.getItem(ANON_KEY);
        if (!anonId) {
            anonId = 'rn_anon_' + Math.random().toString(36).substring(2, 15);
            await AsyncStorage.setItem(ANON_KEY, anonId);
        }
        this.anonymousId = anonId;

        let sessId = await AsyncStorage.getItem(SESSION_KEY);
        if (!sessId) {
            sessId = 'rn_sess_' + Math.random().toString(36).substring(2, 15);
            await AsyncStorage.setItem(SESSION_KEY, sessId);
        }
        this.sessionId = sessId;

        // Load Offline Queue
        const storedQueue = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedQueue) {
            try {
                const parsed = JSON.parse(storedQueue);
                this.queue = [...parsed, ...this.queue];
            } catch (e) {
                console.error('Trusanity: Failed to parse offline queue');
            }
        }
    }

    private initLifecycleTracking() {
        AppState.addEventListener('change', (nextAppState) => {
            if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
                this.track('$session_resume', { os: Platform.OS });
                this.flush(); // Try flushing offline events when app comes to foreground
            } else if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
                this.track('$session_background', { os: Platform.OS });
                this.saveQueue(); // Ensure queue is flushed to disk before suspension
            }
            this.appState = nextAppState;
        });
    }

    public async track(eventName: string, properties: Record<string, any> = {}) {
        const event = {
            name: eventName,
            timestamp: new Date().toISOString(),
            session_id: this.sessionId,
            anonymous_id: this.anonymousId,
            platform: 'react_native',
            properties: {
                ...properties,
                os: Platform.OS,
                osVersion: Platform.Version
            }
        };

        this.queue.push(event);

        // Persist queue immediately
        await this.saveQueue();

        // Attempt network flush
        this.scheduleFlush();
    }

    public identify(userId: string, traits: Record<string, any> = {}) {
        this.track('$identify', { user_id: userId, ...traits });
    }

    private async saveQueue() {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
        } catch (e) {
            console.error('Trusanity: Failed to save queue to AsyncStorage', e);
        }
    }

    private async flush() {
        if (this.queue.length === 0 || this.isFlushing) return;
        this.isFlushing = true;

        const events = [...this.queue];
        const payload = {
            projectId: this.projectId,
            events
        };

        try {
            const res = await fetch(`${this.apiHost}/v1/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Remove successfully flushed events
                this.queue = this.queue.filter(e => !events.includes(e));
                await this.saveQueue();
            }
        } catch (err) {
            console.warn('Trusanity: Network offline, events buffered in SQLite/AsyncStorage.');
        } finally {
            this.isFlushing = false;
        }
    }

    private scheduleFlush() {
        if (this.queue.length >= 10) {
            this.flush();
        } else {
            setTimeout(() => this.flush(), 3000);
        }
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
