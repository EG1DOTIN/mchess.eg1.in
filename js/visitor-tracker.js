/**
 * @file visitor-tracker.js
 * @description Lightweight, privacy-compliant, standalone visitor analytics tracker.
 * Implements the Batched Bucket Document Pattern on Cloud Firestore with sessionStorage throttling.
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
    const MAX_BUCKET_SIZE = 50;

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
        if (/win(dows|98|me|nt|2000|xp|vista|7|8|10|11)/i.test(ua)) return 'Windows';
        if (/android/i.test(ua)) return 'Android';
        if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
        if (/macintosh|mac os x/i.test(ua)) return 'macOS';
        if (/linux/i.test(ua)) return 'Linux';
        if (/cros/i.test(ua)) return 'ChromeOS';
        return 'Unknown OS';
    }

    /**
     * Parse Browser from user agent string
     */
    function detectBrowser(ua) {
        if (/edg/i.test(ua)) return 'Microsoft Edge';
        if (/opr\//i.test(ua) || /opera/i.test(ua)) return 'Opera';
        if (/chrome|crios/i.test(ua)) return 'Chrome';
        if (/firefox|fxios/i.test(ua)) return 'Firefox';
        if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return 'Safari';
        if (/msie|trident/i.test(ua)) return 'Internet Explorer';
        return 'Unknown Browser';
    }

    /**
     * Fetch IP and basic location asynchronously with a 3-second timeout fallback
     */
    async function fetchGeoData() {
        // Attempt 1: Fetch detailed GeoIP from ipapi.co
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                return {
                    ip: data.ip || 'Unknown',
                    city: data.city || 'Unknown',
                    country: data.country_name || data.country || 'Unknown',
                    org: data.org || data.asn || 'Unknown'
                };
            }
        } catch {
            // Fall through to fallback
        }

        // Attempt 2: Fallback to ipify.org for simple public IP
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                return {
                    ip: data.ip || 'Unknown',
                    city: 'Unknown',
                    country: 'Unknown',
                    org: 'Unknown'
                };
            }
        } catch {
            // Fall through
        }

        return {
            ip: 'Unknown',
            city: 'Unknown',
            country: 'Unknown',
            org: 'Unknown'
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
     * Main tracking function executed on page load
     */
    async function trackVisitor() {
        // Step 1: Session Throttling - Check if already logged this session
        try {
            if (sessionStorage.getItem(SESSION_KEY)) {
                return; // Already recorded for this session, saves Firestore write quota
            }
        } catch {
            // sessionStorage might be restricted in some iframe/sandbox modes
        }

        // Step 2: Extract client telemetry
        const ua = navigator.userAgent || '';
        const detectedOS = detectOS(ua);
        const detectedBrowser = detectBrowser(ua);
        let timezone = 'Unknown';
        try {
            timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
        } catch {}

        const appName = window.location.hostname || 'mchess.eg1.in';
        const pageVisited = window.location.pathname || '/';
        const referrer = document.referrer ? new URL(document.referrer, window.location.origin).pathname : 'Direct';

        // Step 3: Fetch GeoIP details non-blockingly
        const geo = await fetchGeoData();

        const logEntry = {
            appName: appName,
            pageVisited: pageVisited,
            referrer: referrer,
            ip: geo.ip,
            city: geo.city,
            country: geo.country,
            org: geo.org,
            os: detectedOS,
            browser: detectedBrowser,
            timezone: timezone,
            screen: window.screen ? `${window.screen.width}x${window.screen.height}` : 'Unknown',
            timestamp: new Date().toISOString()
        };

        // Step 4: Write to Firestore via Batched Bucket Transaction
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

                // If current page bucket is full (e.g. 50 records), start a new page
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

        } catch (err) {
            console.warn('Visitor tracking telemetry failed (non-critical):', err.message);
        }
    }

    // Execute tracking asynchronously once the page is interactive
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(trackVisitor, 500);
    } else {
        window.addEventListener('DOMContentLoaded', () => setTimeout(trackVisitor, 500));
    }
})();
