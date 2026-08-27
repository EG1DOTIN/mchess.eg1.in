/**
 * @file news.js
 * @description Client-side controller for Marwadi Chess What's New & Product Updates feed (news.html).
 * Loads news.json (latest first), manages category filter tabs and search query.
 * @project Marwadi Chess (mchess.eg1.in)
 */

(function ($) {
    'use strict';

    let allNews = [];
    let activeFilter = 'all';
    let searchQuery = '';

    /**
     * Map target link to friendly descriptive CTA text
     */
    function getCtaLabel(link, title) {
        if (!link) return 'View Update →';
        if (link.includes('playonline')) return 'Explore on Play Online →';
        if (link.includes('playcomp')) return 'Try on Play vs Computer →';
        if (link.includes('dailypuzzles')) return 'Solve Daily Puzzles →';
        if (link.includes('mygames')) return 'Open My Played Games →';
        if (link.includes('about')) return 'Visit About Heritage →';
        if (link.includes('watchlive')) return 'Watch Live Channels →';
        if (link.includes('pgngames')) return 'Browse PGN Database →';
        if (link.includes('chesstraps')) return 'Learn Chess Traps →';
        if (link.includes('train')) return 'Train Tactics Now →';
        return 'Open Page →';
    }

    /**
     * Fetch news.json feed from data/news.json
     */
    async function loadNewsData() {
        const $container = $('#newsFeedContainer');
        $container.html(`
            <div style="text-align:center; padding: 40px; color:#94a3b8;">
                <i class="fas fa-spinner fa-spin" style="font-size:28px; color:#38bdf8; margin-bottom:12px;"></i>
                <p>Loading latest updates feed...</p>
            </div>
        `);

        try {
            const res = await fetch('data/news.json?_t=' + Date.now());
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            allNews = Array.isArray(data) ? data : [];
            updateStats();
            renderFeed();
        } catch (err) {
            console.error('[MChessNews] Could not load data/news.json:', err);
            $container.html(`
                <div class="news-empty-state">
                    <i class="fas fa-exclamation-triangle" style="font-size:28px; color:#f87171; margin-bottom:10px;"></i>
                    <p>Unable to load news feed at this time. Please check back soon.</p>
                </div>
            `);
        }
    }

    /**
     * Updates header statistics
     */
    function updateStats() {
        $('#statTotalUpdates').text(allNews.length);
        const latestVer = allNews.find(n => n.version)?.version || '3.5.1';
        $('#statLatestVersion').text('v' + latestVer);
    }

    /**
     * Filters and renders news feed
     */
    function renderFeed() {
        const $container = $('#newsFeedContainer');
        if (!allNews.length) {
            $container.html(`
                <div class="news-empty-state">
                    <i class="fas fa-info-circle" style="font-size:28px; color:#38bdf8; margin-bottom:10px;"></i>
                    <p>No updates found.</p>
                </div>
            `);
            return;
        }

        const filtered = allNews.filter(item => {
            // Category filter
            if (activeFilter !== 'all') {
                const badge = (item.badge || '').toLowerCase();
                if (activeFilter === 'feature' && !badge.includes('feature')) return false;
                if (activeFilter === 'fix' && !badge.includes('fix')) return false;
                if (activeFilter === 'optimization' && !badge.includes('opt')) return false;
                if (activeFilter === 'tactics' && !badge.includes('tactics') && !badge.includes('ai')) return false;
                if (activeFilter === 'heritage' && !badge.includes('heritage')) return false;
            }

            // Text search query
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const titleMatch = (item.title || '').toLowerCase().includes(q);
                const descMatch = (item.message || '').toLowerCase().includes(q);
                const verMatch = (item.version || '').toLowerCase().includes(q);
                const badgeMatch = (item.badge || '').toLowerCase().includes(q);
                if (!titleMatch && !descMatch && !verMatch && !badgeMatch) return false;
            }

            return true;
        });

        if (filtered.length === 0) {
            $container.html(`
                <div class="news-empty-state">
                    <i class="fas fa-search" style="font-size:28px; color:#94a3b8; margin-bottom:10px;"></i>
                    <p>No updates matching your filter or search query.</p>
                </div>
            `);
            return;
        }

        const html = filtered.map(item => {
            const iconClass = item.icon || 'fa-bell';
            const badgeText = item.badge || 'Update';
            const badgeColor = item.badgeColor || '#38bdf8';
            const versionHtml = item.version ? `<span class="news-version-pill">v${item.version}</span>` : '';
            const pinnedHtml = item.pinned ? `<span class="news-pinned-tag"><i class="fas fa-thumbtack"></i> Pinned</span>` : '';
            const ctaLabel = getCtaLabel(item.link, item.title);
            const linkUrl = item.link || 'index.html';

            return `
                <article class="news-card ${item.pinned ? 'is-pinned' : ''}">
                    <div class="news-card-icon-wrap" style="background: ${badgeColor}22; color: ${badgeColor}; border: 1px solid ${badgeColor}55;">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="news-card-content">
                        <div class="news-card-topbar">
                            <div class="news-badge-group">
                                <span class="news-badge-pill" style="background: ${badgeColor}22; color: ${badgeColor}; border: 1px solid ${badgeColor}44;">${badgeText}</span>
                                ${versionHtml}
                                ${pinnedHtml}
                            </div>
                            <span class="news-date">${item.date || ''}</span>
                        </div>
                        <h3 class="news-card-title">${item.title}</h3>
                        <p class="news-card-msg">${item.message}</p>
                        <div class="news-card-footer">
                            <a href="${linkUrl}" class="news-action-link">
                                <span>${ctaLabel}</span>
                            </a>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        $container.html(html);
    }

    /**
     * Bind UI event listeners
     */
    function bindEvents() {
        // Filter tabs
        $('.news-filter-btn').on('click', function () {
            $('.news-filter-btn').removeClass('active');
            $(this).addClass('active');
            activeFilter = $(this).data('filter') || 'all';
            renderFeed();
        });

        // Search input
        $('#txtNewsSearch').on('input', function () {
            searchQuery = ($(this).val() || '').trim();
            renderFeed();
        });
    }

    $(document).ready(function () {
        bindEvents();
        loadNewsData();
    });

})(jQuery);
