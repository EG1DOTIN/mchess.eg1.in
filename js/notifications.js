/**
 * @file notifications.js
 * @description In-Site "What's New" Bell Notification System for Marwadi Chess.
 * Fetches news.json feed, tracks read/unread status in localStorage, and manages dropdown UI.
 * @project Marwadi Chess (mchess.eg1.in)
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'mchess_read_notifications_v1';
    let activeNews = [];
    let isInitialized = false;

    /**
     * Helper to get list of read notification IDs from localStorage
     */
    function getReadIds() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Helper to save read notification IDs to localStorage
     */
    function saveReadIds(ids) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        } catch (e) {
            console.warn('[MChessNotifications] localStorage unavailable', e);
        }
    }

    /**
     * Marks a single announcement ID as read
     */
    function markAsRead(id) {
        const readIds = getReadIds();
        if (!readIds.includes(id)) {
            readIds.push(id);
            saveReadIds(readIds);
            updateBadgeState();
        }
    }

    /**
     * Marks all active announcements as read
     */
    function markAllAsRead() {
        const allIds = activeNews.map(item => item.id);
        saveReadIds(allIds);
        
        const $btn = document.getElementById('headerNotifyBtn');
        const $badge = document.getElementById('headerNotifyBadge');
        if ($badge) $badge.style.display = 'none';
        if ($btn) $btn.classList.remove('is-ringing');

        const cards = document.querySelectorAll('.notify-card');
        cards.forEach(card => card.classList.remove('is-unread'));
    }

    /**
     * Calculates whether unread announcements exist and updates the bell badge & ringing animation
     */
    function updateBadgeState() {
        const $btn = document.getElementById('headerNotifyBtn');
        const $badge = document.getElementById('headerNotifyBadge');
        if (!activeNews.length) {
            if ($badge) $badge.style.display = 'none';
            if ($btn) $btn.classList.remove('is-ringing');
            return;
        }

        const readIds = getReadIds();
        const hasUnread = activeNews.some(item => !readIds.includes(item.id));

        if (hasUnread) {
            if ($badge) $badge.style.display = 'block';
            if ($btn) $btn.classList.add('is-ringing');
        } else {
            if ($badge) $badge.style.display = 'none';
            if ($btn) $btn.classList.remove('is-ringing');
        }
    }

    /**
     * Renders announcements into the dropdown feed container
     */
    function renderNewsList(news) {
        const $container = document.getElementById('notifyListContainer');
        if (!$container) return;

        if (!news || !news.length) {
            $container.innerHTML = `
                <div class="notify-empty">
                    <i class="fas fa-check-circle" style="color:#10b981; font-size:24px; margin-bottom:8px;"></i>
                    <p>You're all caught up!</p>
                </div>
            `;
            return;
        }

        const readIds = getReadIds();

        $container.innerHTML = news.map(item => {
            const isUnread = !readIds.includes(item.id);
            const iconClass = item.icon || 'fa-bell';
            const badgeText = item.badge || 'Update';
            const badgeColor = item.badgeColor || '#eab308';
            const versionHtml = item.version ? `<span class="notify-version-tag">v${item.version}</span>` : '';
            const dateText = item.date || '';
            const linkUrl = item.link || 'index.html';

            return `
                <a href="${linkUrl}" class="notify-card ${isUnread ? 'is-unread' : ''}" data-id="${item.id}">
                    <div class="notify-card-icon" style="color: ${badgeColor};">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="notify-card-body">
                        <div class="notify-card-top">
                            <div class="notify-card-badges">
                                <span class="notify-chip" style="background: ${badgeColor}22; color: ${badgeColor}; border: 1px solid ${badgeColor}44;">${badgeText}</span>
                                ${versionHtml}
                            </div>
                            <span class="notify-card-date">${dateText}</span>
                        </div>
                        <h5 class="notify-card-title">${item.title}</h5>
                        <p class="notify-card-desc">${item.message}</p>
                    </div>
                    ${isUnread ? '<span class="notify-unread-dot" title="Unread"></span>' : ''}
                </a>
            `;
        }).join('');

        // Attach click listeners to individual cards to mark as read and close panel
        const cards = $container.querySelectorAll('.notify-card');
        cards.forEach(card => {
            card.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                if (id) markAsRead(id);
                const $dropdown = document.getElementById('headerNotifyDropdown');
                const $btn = document.getElementById('headerNotifyBtn');
                if ($dropdown) $dropdown.style.display = 'none';
                if ($btn) $btn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /**
     * Fetches the news.json feed from root
     */
    async function fetchNewsFeed() {
        try {
            const response = await fetch('news.json?_t=' + Date.now());
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            activeNews = Array.isArray(data) ? data : [];
            renderNewsList(activeNews);
            updateBadgeState();
        } catch (err) {
            console.warn('[MChessNotifications] Could not fetch news.json feed:', err);
        }
    }

    /**
     * Toggles dropdown open/closed state
     */
    function toggleDropdown(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const $btn = document.getElementById('headerNotifyBtn');
        const $dropdown = document.getElementById('headerNotifyDropdown');
        if (!$dropdown || !$btn) return;

        const isCurrentlyOpen = $dropdown.style.display === 'block';

        if (isCurrentlyOpen) {
            $dropdown.style.display = 'none';
            $btn.setAttribute('aria-expanded', 'false');
        } else {
            $dropdown.style.display = 'block';
            $btn.setAttribute('aria-expanded', 'true');
        }
    }

    /**
     * Initializes DOM event listeners for notification button and dropdown
     */
    function initNotificationHandlers() {
        const $btn = document.getElementById('headerNotifyBtn');
        const $dropdown = document.getElementById('headerNotifyDropdown');
        const $markAllBtn = document.getElementById('markAllReadBtn');

        if (!$btn || !$dropdown) return;

        // Toggle dropdown on button click
        $btn.removeEventListener('click', toggleDropdown);
        $btn.addEventListener('click', toggleDropdown);

        // Mark all as read button
        if ($markAllBtn) {
            $markAllBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                markAllAsRead();
            });
        }

        // Close on outside click
        document.addEventListener('click', function (e) {
            if ($dropdown.style.display === 'block' && !$dropdown.contains(e.target) && !$btn.contains(e.target)) {
                $dropdown.style.display = 'none';
                $btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && $dropdown.style.display === 'block') {
                $dropdown.style.display = 'none';
                $btn.setAttribute('aria-expanded', 'false');
                $btn.focus();
            }
        });

        // Fetch feed & update badge
        fetchNewsFeed();
    }

    /**
     * Global entry point to initialize notifications (can be called repeatedly after AJAX template load)
     */
    window.initializeNotifications = function () {
        initNotificationHandlers();
    };

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initializeNotifications);
    } else {
        window.initializeNotifications();
    }

})();
