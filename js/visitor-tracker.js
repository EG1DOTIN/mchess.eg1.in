/**
 * @file visitor-tracker.js
 * @description Lightweight, privacy-compliant, standalone visitor analytics tracker.
 * Implements the Batched Bucket Document Pattern on Cloud Firestore with sessionStorage throttling
 * and a Notice with Opt-Out user consent banner.
 * @project MCHESS Interactive Chess Portal (Reusable across eg1.in ecosystem)
 */

(function () {
    'use strict';

    // Firebase Public Config (Safe for public client-side telemetry)
    const TRACKER_FIREBASE_CONFIG = {
        apiKey: "AIzaSyCr3D3WnaYtmgoaFIeYgF2cJjZaL-Ap798",
        authDomain: "mchess-9686d.firebaseapp.com",
        projectId: "mchess-9686d",
        storageBucket: "mchess-9686d.firebasestorage.app",
        messagingSenderId: "424666867149",
        appId: "1:424666867149:web:faebb85a29bb60b5261084"
    };

    const SESSION_KEY = 'mchess_visitor_session_logged';
    const CONSENT_STORAGE_KEY = 'mchess_analytics_consent';
    const MAX_BUCKET_SIZE = 50;
    const GEO_TIMEOUT_MS = 3500;

    /**
     * Get ISO Date string (YYYY-MM-DD)
     */
    function getTodayString() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    /**
     * Parse OS from user agent string
     */
    function detectOS(ua) {
        if (/windows phone/i.test(ua)) return 'Windows Phone';
        if (/windows nt 10.0/i.test(ua)) return 'Windows 10/11';
        if (/windows nt 6.3/i.test(ua)) return 'Windows 8.1';
        if (/windows nt 6.2/i.test(ua)) return 'Windows 8';
        if (/windows nt 6.1/i.test(ua)) return 'Windows 7';
        if (/windows/i.test(ua)) return 'Windows';
        if (/android/i.test(ua)) return 'Android';
        if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
        if (/macintosh|mac os x/i.test(ua)) return 'macOS';
        if (/cros/i.test(ua)) return 'ChromeOS';
        if (/linux/i.test(ua)) return 'Linux';
        return 'Unknown OS';
    }

    /**
     * Parse Browser from user agent string
     */
    function detectBrowser(ua) {
        if (/edg\//i.test(ua)) return 'Microsoft Edge';
        if (/samsungbrowser/i.test(ua)) return 'Samsung Internet';
        if (/opr\//i.test(ua) || /opera/i.test(ua)) return 'Opera';
        if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua) && !/opr\//i.test(ua)) return 'Chrome';
        if (/firefox|fxios/i.test(ua)) return 'Firefox';
        if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return 'Safari';
        if (/msie|trident/i.test(ua)) return 'Internet Explorer';
        return 'Unknown Browser';
    }

    /**
     * Fetch IP and location metadata asynchronously with timeout and fallback
     */
    async function fetchGeoData() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);

        // Attempt 1: Fetch detailed GeoIP from ipapi.co
        try {
            const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                if (data && data.ip) {
                    return {
                        ip: data.ip || 'Unknown',
                        city: data.city || 'Unknown',
                        region: data.region || 'Unknown',
                        country: data.country_name || data.country || 'Unknown',
                        org: data.org || data.asn || 'Unknown',
                        postal: data.postal || 'Unknown'
                    };
                }
            }
        } catch {
            // Fall through to fallback
        } finally {
            clearTimeout(timeoutId);
        }

        // Attempt 2: Fallback to ipify.org for public IP
        try {
            const fbController = new AbortController();
            const fbTimeout = setTimeout(() => fbController.abort(), 2000);
            const res = await fetch('https://api.ipify.org?format=json', { signal: fbController.signal });
            clearTimeout(fbTimeout);
            if (res.ok) {
                const data = await res.json();
                return {
                    ip: data.ip || 'Unknown',
                    city: 'Unknown',
                    region: 'Unknown',
                    country: 'Unknown',
                    org: 'Unknown',
                    postal: 'Unknown'
                };
            }
        } catch {
            // Fully offline or blocked
        }

        return {
            ip: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            org: 'Unknown',
            postal: 'Unknown'
        };
    }

    /**
     * Dynamically loads a script if needed
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Ensures Firebase App and Firestore SDKs are initialized
     */
    async function ensureFirebase() {
        if (!window.firebase) {
            await loadScript('https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js');
        }
        if (!window.firebase.firestore) {
            await loadScript('https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore-compat.js');
        }

        if (!window.firebase.apps || window.firebase.apps.length === 0) {
            window.firebase.initializeApp(TRACKER_FIREBASE_CONFIG);
        }

        return window.firebase.firestore();
    }

    /**
     * Shows a non-intrusive, floating consent & opt-out banner if choice is not yet saved.
     */
    function initConsentBanner() {
        try {
            if (localStorage.getItem(CONSENT_STORAGE_KEY)) {
                return; // User has already chosen OK or Decline
            }
        } catch {
            return;
        }

        if (document.getElementById('analytics-consent-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'analytics-consent-banner';
        banner.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                width: calc(100% - 32px);
                max-width: 680px;
                background: rgba(15, 23, 42, 0.94);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                color: #f8fafc;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
                padding: 14px 20px;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                font-size: 13.5px;
                line-height: 1.5;
                box-sizing: border-box;
                animation: mchessBannerSlideUp 0.35s ease-out;
            ">
                <div style="flex: 1; min-width: 220px;">
                    <span>We collect anonymous information to optimize tools/Apps performance.</span>
                    <a href="privacypolicy.html" style="color: #60a5fa; text-decoration: underline; margin-left: 6px; font-weight: 500;">Privacy Policy</a>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                    <button id="analytics-btn-decline" type="button" style="
                        background: rgba(255, 255, 255, 0.08);
                        color: #cbd5e1;
                        border: 1px solid rgba(255, 255, 255, 0.22);
                        padding: 7px 15px;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">Decline</button>
                    <button id="analytics-btn-ok" type="button" style="
                        background: #2563eb;
                        color: #ffffff;
                        border: none;
                        padding: 7px 18px;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    ">OK</button>
                </div>
            </div>
            <style>
                @keyframes mchessBannerSlideUp {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                #analytics-btn-decline:hover {
                    background: rgba(239, 68, 68, 0.2) !important;
                    color: #fca5a5 !important;
                    border-color: #ef4444 !important;
                }
                #analytics-btn-ok:hover {
                    background: #1d4ed8 !important;
                }
                @media (max-width: 580px) {
                    #analytics-consent-banner > div {
                        flex-direction: column !important;
                        text-align: center !important;
                        gap: 12px !important;
                        padding: 14px 16px !important;
                    }
                    #analytics-consent-banner > div > div:last-child {
                        width: 100% !important;
                        justify-content: center !important;
                    }
                }
            </style>
        `;

        document.body.appendChild(banner);

        const okBtn = document.getElementById('analytics-btn-ok');
        const declineBtn = document.getElementById('analytics-btn-decline');

        if (okBtn) {
            okBtn.addEventListener('click', function () {
                try { localStorage.setItem(CONSENT_STORAGE_KEY, 'granted'); } catch {}
                banner.remove();
            });
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', function () {
                try {
                    localStorage.setItem(CONSENT_STORAGE_KEY, 'denied');
                    sessionStorage.removeItem(SESSION_KEY);
                } catch {}
                banner.remove();
            });
        }
    }

    /**
     * Main tracking function executed on page load
     */
    async function trackVisitor() {
        // Step 1: Opt-Out & Consent Check
        try {
            if (localStorage.getItem(CONSENT_STORAGE_KEY) === 'denied') {
                return; // User has chosen to decline telemetry
            }
        } catch {
            // sessionStorage might be restricted
        }

        // Step 2: Session Throttling - Check if already logged this session
        try {
            if (sessionStorage.getItem(SESSION_KEY)) {
                return; // Already recorded for this session, saves Firestore write quota
            }
        } catch {
            // sessionStorage might be restricted
        }

        // Step 3: Extract client telemetry
        const ua = navigator.userAgent || '';
        const detectedOS = detectOS(ua);
        const detectedBrowser = detectBrowser(ua);
        let timezone = 'Unknown';
        try {
            timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
        } catch {}

        let appName = window.location.hostname || 'mchess.eg1.in';
        const currentScript = document.currentScript || document.querySelector('script[src*="visitor-tracker.js"]');
        if (currentScript && currentScript.getAttribute('data-app')) {
            appName = currentScript.getAttribute('data-app');
        }

        const pageVisited = window.location.pathname + (window.location.search || '');
        
        let referrer = 'Direct';
        if (document.referrer) {
            try {
                referrer = new URL(document.referrer, window.location.href).hostname || 'Direct';
            } catch {
                referrer = 'Unknown';
            }
        }

        const language = navigator.language || 'en';
        const screenRes = window.screen ? `${window.screen.width}x${window.screen.height}` : 'Unknown';

        // Step 4: Fetch GeoIP details non-blockingly
        const geo = await fetchGeoData();

        const logId = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

        const logEntry = {
            id: logId,
            appName: appName,
            pageVisited: pageVisited || '/',
            referrer: referrer,
            ip: geo.ip,
            city: geo.city,
            region: geo.region,
            country: geo.country,
            org: geo.org,
            postal: geo.postal,
            os: detectedOS,
            browser: detectedBrowser,
            timezone: timezone,
            screen: screenRes,
            language: language,
            timestamp: new Date().toISOString()
        };

        // Step 5: Write to Firestore via Batched Bucket Transaction
        try {
            const db = await ensureFirebase();
            const metaRef = db.collection('visitor_analytics').doc('meta');
            const todayStr = getTodayString();

            await db.runTransaction(async (transaction) => {
                const metaSnap = await transaction.get(metaRef);

                let currentPage = 1;
                let currentCount = 0;
                let totalVisitors = 0;
                let todayDate = todayStr;
                let todayCount = 0;

                if (metaSnap.exists) {
                    const data = metaSnap.data() || {};
                    currentPage = data.currentPage || 1;
                    currentCount = data.currentCount || 0;
                    totalVisitors = data.totalVisitors || 0;

                    if (data.todayDate === todayStr) {
                        todayCount = data.todayCount || 0;
                    } else {
                        todayDate = todayStr;
                        todayCount = 0;
                    }
                }

                // If current page bucket is full (50 records), start a new page
                if (currentCount >= MAX_BUCKET_SIZE) {
                    currentPage++;
                    currentCount = 0;
                }

                const pageRef = db.collection('visitor_analytics').doc('page_' + currentPage);

                // Append log entry to active page document
                transaction.set(pageRef, {
                    pageNum: currentPage,
                    logs: window.firebase.firestore.FieldValue.arrayUnion(logEntry),
                    lastUpdated: new Date().toISOString()
                }, { merge: true });

                // Update metadata document
                transaction.set(metaRef, {
                    currentPage: currentPage,
                    currentCount: currentCount + 1,
                    totalVisitors: totalVisitors + 1,
                    todayDate: todayDate,
                    todayCount: todayCount + 1,
                    lastUpdated: window.firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            });

            // Mark session as logged
            try {
                sessionStorage.setItem(SESSION_KEY, '1');
            } catch {}

            // Dispatch diagnostic event
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('mchess:visitor-tracked', { detail: logEntry }));
            }

        } catch (err) {
            console.warn('Visitor tracking telemetry failed (non-critical):', err.message);
        }
    }

    // Execute when page is ready (non-blocking)
    function onPageReady() {
        initConsentBanner();
        setTimeout(trackVisitor, 400);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        onPageReady();
    } else {
        window.addEventListener('DOMContentLoaded', onPageReady);
    }

    // Expose manual API for SPA route changes, opt-in/opt-out toggling, or diagnostic resets
    window.MChessTracker = {
        track: trackVisitor,
        resetSession: function () {
            try { sessionStorage.removeItem(SESSION_KEY); } catch { /* no-op */ }
        },
        optOut: function () {
            try {
                localStorage.setItem(CONSENT_STORAGE_KEY, 'denied');
                sessionStorage.removeItem(SESSION_KEY);
            } catch {}
        },
        optIn: function () {
            try {
                localStorage.setItem(CONSENT_STORAGE_KEY, 'granted');
                trackVisitor();
            } catch {}
        },
        showConsentBanner: function () {
            try { localStorage.removeItem(CONSENT_STORAGE_KEY); } catch {}
            initConsentBanner();
        }
    };
    window.EG1Tracker = window.MChessTracker; // Alias for cross-project compatibility

})();
