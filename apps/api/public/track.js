/**
 * Trusanity Analytics Browser SDK v1.0.0
 * Served from: GET https://api.trusanity.com/track.js
 *
 * Usage (auto via script tag):
 *   <script defer src="https://api.trusanity.com/track.js" data-site-id="trus_pk_xxx"></script>
 *
 * Manual tracking:
 *   trusanity('track', 'Button_Clicked', { label: 'Buy Now' })
 *   trusanity('identify', 'user_abc123')
 */
(function () {
    'use strict';

    // ── Bootstrap ──────────────────────────────────────────────────────────
    var scriptEl = document.currentScript || (function () {
        var tags = document.getElementsByTagName('script');
        return tags[tags.length - 1];
    })();

    var API_KEY  = scriptEl.getAttribute('data-site-id');
    var API_HOST = (scriptEl.getAttribute('data-api-host') || 'https://api.trusanity.com').replace(/\/$/, '');

    if (!API_KEY) { console.warn('[Trusanity] Missing data-site-id attribute.'); return; }

    // ── Identity ───────────────────────────────────────────────────────────
    function storage(key, val) {
        try {
            if (val !== undefined) localStorage.setItem(key, val);
            return localStorage.getItem(key);
        } catch (e) { return null; }
    }

    var ANON_KEY = '_trus_aid_' + API_KEY;
    var anonId = storage(ANON_KEY) || (function () {
        var id = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        storage(ANON_KEY, id);
        return id;
    })();

    var userId = storage('_trus_uid_' + API_KEY) || '';

    // ── Session ────────────────────────────────────────────────────────────
    var SESSION_TIMEOUT = 30 * 60 * 1000;
    var SESSION_KEY = '_trus_ses_' + API_KEY;
    var session;
    try { session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { session = null; }
    if (!session || (Date.now() - session.t) > SESSION_TIMEOUT) {
        session = { id: 'ses_' + Math.random().toString(36).slice(2) + Date.now().toString(36), t: Date.now() };
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) {}
    }

    function refreshSession() {
        session.t = Date.now();
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) {}
    }

    // ── Event Queue ────────────────────────────────────────────────────────
    var queue = [];
    var flushing = false;
    var flushTimer = null;

    function sendBatch(batch) {
        var payload = JSON.stringify({ projectId: API_KEY, events: batch });
        // Use sendBeacon for unload events, fetch otherwise
        if (typeof navigator.sendBeacon === 'function' &&
            navigator.sendBeacon(API_HOST + '/v1/ingest', new Blob([payload], { type: 'application/json' }))) {
            return;
        }
        fetch(API_HOST + '/v1/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
            body: payload,
            keepalive: true,
        }).catch(function () {});
    }

    function flush() {
        if (flushing || queue.length === 0) return;
        flushing = true;
        var batch = queue.splice(0, 25);
        sendBatch(batch);
        flushing = false;
        if (queue.length > 0) { flushTimer = setTimeout(flush, 200); }
    }

    function scheduleFlush() {
        if (flushTimer) clearTimeout(flushTimer);
        flushTimer = setTimeout(flush, 50);
    }

    // Flush on page hide
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') flush();
    });
    window.addEventListener('pagehide', flush);

    // ── Core track ─────────────────────────────────────────────────────────
    function track(eventName, properties) {
        refreshSession();
        queue.push({
            name: eventName,
            session_id: session.id,
            anonymous_id: anonId,
            user_id: userId || undefined,
            url: window.location.href,
            path: window.location.pathname,
            referrer: document.referrer || '',
            timestamp: new Date().toISOString(),
            properties: properties || {},
        });
        scheduleFlush();
    }

    function identify(id) {
        if (!id) return;
        userId = String(id);
        storage('_trus_uid_' + API_KEY, userId);
    }

    // ── Public API ─────────────────────────────────────────────────────────
    var publicApi = function (method, arg1, arg2) {
        if (method === 'track')    return track(arg1, arg2);
        if (method === 'identify') return identify(arg1);
    };

    // Drain any pre-init calls (pattern: window.trusanity.q = [...])
    var preInit = (window.trusanity && window.trusanity.q) || [];
    window.trusanity = publicApi;
    for (var i = 0; i < preInit.length; i++) publicApi.apply(null, preInit[i]);

    // ── Auto Pageview ──────────────────────────────────────────────────────
    function trackPageview() {
        track('$pageview', {
            title: document.title,
            url: window.location.href,
            path: window.location.pathname,
            search: window.location.search,
        });
    }

    // Initial pageview
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageview);
    } else {
        trackPageview();
    }

    // SPA navigation (pushState / replaceState)
    function wrapHistory(method) {
        var orig = history[method];
        history[method] = function () {
            orig.apply(history, arguments);
            setTimeout(trackPageview, 0);
        };
    }
    wrapHistory('pushState');
    wrapHistory('replaceState');
    window.addEventListener('popstate', trackPageview);

    // ── Signal Ready ───────────────────────────────────────────────────────
    try { window.dispatchEvent(new Event('trusanity:ready')); } catch (e) {}

})();
