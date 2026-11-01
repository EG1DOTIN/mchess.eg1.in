/**
 * @file mchess-live-board.js
 * @description Advanced Multi-Channel Live Chess Broadcast Component for MCHESS.
 * Features Theater / Stadium Mode with Zero-Scroll desktop layout, instant 1-touch channel switching,
 * responsive mobile horizontal pill strip, Multi-Grid mode (All 6 Channels), and Fullscreen modal expansion.
 * @project MCHESS Interactive Chess Portal
 */

(function ($) {
    'use strict';

    class MChessLiveGrid {
        constructor(containerEl, options = {}) {
            this.$container = $(containerEl);
            this.options = Object.assign({
                defaultMode: 'theater', // 'theater' or 'grid'
                defaultChannel: 'best'
            }, options);

            this.channels = [
                { id: 'best', name: 'Top Grandmaster Broadcast', icon: 'fa-trophy', color: '#d4af37', badge: 'TOP GM', desc: 'World elite Grandmasters competing in live tournaments' },
                { id: 'blitz', name: 'Live Blitz Championship', icon: 'fa-bolt', color: '#eab308', badge: 'BLITZ', desc: 'High-speed 3m to 5m tactical blitz battles' },
                { id: 'rapid', name: 'Live Rapid Championship', icon: 'fa-stopwatch', color: '#3b82f6', badge: 'RAPID', desc: 'Master level 10m to 15m rapid chess matches' },
                { id: 'bullet', name: 'Live Bullet Speed Channel', icon: 'fa-fire', color: '#ef4444', badge: 'BULLET', desc: 'Lightning-fast 1-minute bullet games' },
                { id: 'classical', name: 'Live Classical Tournament', icon: 'fa-chess-king', color: '#10b981', badge: 'CLASSICAL', desc: 'Deep tournament games with long time controls' },
                { id: 'ultraBullet', name: 'Live UltraBullet Speed', icon: 'fa-rocket', color: '#ec4899', badge: 'ULTRA BULLET', desc: 'Crazy 30-second hyper-bullet chess' }
            ];

            this.viewMode = this.options.defaultMode; // 'theater' or 'grid'
            this.currentChannel = this.options.defaultChannel;
            this.uid = Math.random().toString(36).substr(2, 7);

            this.initLayout();
            this.bindEvents();
        }

        initLayout() {
            if (this.$container.children().length > 0) {
                this.$container.empty();
            }

            const activeChannelObj = this.channels.find(c => c.id === this.currentChannel) || this.channels[0];
            const isTheater = this.viewMode === 'theater';
            const bgParam = 'dark'; // Dark theme metal frame is the official high-contrast broadcast standard

            const html = `
                <div class="pgn-viewer-container live-viewer-container">
                    <!-- Streamlined Broadcast Header -->
                    <div class="live-broadcast-header">
                        <div class="live-header-info">
                            <div class="live-title-row">
                                <span class="live-pulse-badge">
                                    <span class="pulse-dot"></span> LIVE
                                </span>
                                <h1 class="live-main-title" id="liveMainTitle_${this.uid}">
                                    <i class="fas ${activeChannelObj.icon}" style="color:${activeChannelObj.color};"></i>
                                    ${activeChannelObj.name}
                                </h1>
                            </div>
                            <p class="live-subtitle" id="liveSubtitle_${this.uid}">
                                ${activeChannelObj.desc}
                            </p>
                        </div>

                        <div class="live-header-controls">
                            <!-- Mode Switcher Buttons -->
                            <div class="view-mode-toggle" id="viewModeToggle_${this.uid}">
                                <button type="button" class="btn-mode-toggle ${isTheater ? 'active' : ''}" data-mode="theater" title="Focus on single featured broadcast">
                                    <i class="fas fa-tv"></i> <span class="mode-text">Theater View</span>
                                </button>
                                <button type="button" class="btn-mode-toggle ${!isTheater ? 'active' : ''}" data-mode="grid" title="Watch all 6 channels simultaneously">
                                    <i class="fas fa-th-large"></i> <span class="mode-text">All 6 Channels</span>
                                </button>
                            </div>

                            <button type="button" class="btn-fullscreen-main" id="btnFullscreenMain_${this.uid}" title="Watch active stream in full screen">
                                <i class="fas fa-expand"></i> <span class="btn-text">Fullscreen</span>
                            </button>
                        </div>
                    </div>

                    <!-- Channel Switcher Strip (Horizontal Scrollable on Mobile, Wrap on Desktop) -->
                    <div class="channel-filter-bar live-channel-pills" id="channelPills_${this.uid}">
                        ${this.channels.map(c => `
                            <button type="button" class="filter-tab live-pill-tab ${c.id === this.currentChannel ? 'active' : ''}" data-channel="${c.id}" title="${c.name} • ${c.desc}" aria-label="${c.name}">
                                <i class="fas ${c.icon}" style="color:${c.color};"></i>
                                <span class="pill-badge-text">${c.badge}</span>
                            </button>
                        `).join('')}
                    </div>

                    <!-- 1. THEATER STAGE (Featured Single Stream with Zero-Scroll) -->
                    <div class="live-theater-stage" id="liveTheaterStage_${this.uid}" style="display: ${isTheater ? 'block' : 'none'};">
                        <div class="theater-board-wrapper" id="theaterBoardWrapper_${this.uid}">
                            <iframe id="theaterFrame_${this.uid}" src="https://lichess.org/tv/${this.currentChannel}/frame?theme=metal&bg=${bgParam}" allowtransparency="true" frameborder="0"></iframe>
                            <div class="theater-board-mask" id="theaterBoardMask_${this.uid}" title="Click to watch in Fullscreen">
                                <span class="theater-click-hint"><i class="fas fa-expand"></i> Fullscreen</span>
                            </div>
                        </div>
                        <div class="theater-action-bar">
                            <div class="theater-channel-meta">
                                <span class="meta-tag"><i class="fas fa-broadcast-tower"></i> Real-time Multi-Stream</span>
                                <span class="meta-tag"><i class="fas fa-signal"></i> 60fps Broadcast</span>
                            </div>
                            <div class="theater-actions">
                                <a id="btnLichessExternal_${this.uid}" href="https://lichess.org/tv/${this.currentChannel}" target="_blank" rel="noopener noreferrer" class="btn-action-link" title="Open and analyze on Lichess in new tab">
                                    <i class="fas fa-external-link-alt"></i> Open on Lichess
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- 2. MULTI-GRID STAGE (All 6 Channels Simultaneously) -->
                    <div id="liveGridWrapper_${this.uid}" class="live-channels-grid" style="display: ${isTheater ? 'none' : 'grid'};">
                        ${this.channels.map(c => `
                            <div class="live-channel-card" data-channel="${c.id}">
                                <div class="live-channel-header" style="border-top-color: ${c.color};">
                                    <div class="live-channel-title">
                                        <i class="fas ${c.icon}" style="color:${c.color}; font-size: 14px;"></i>
                                        <span>${c.name}</span>
                                    </div>
                                    <div class="live-channel-actions">
                                        <button type="button" class="btn-expand-live" data-channel="${c.id}" title="Watch Fullscreen">
                                            <i class="fas fa-expand"></i> Fullscreen
                                        </button>
                                        <span class="live-indicator-badge">
                                            <i class="fas fa-circle" style="font-size: 7px; color: #ef4444;"></i> LIVE
                                        </span>
                                    </div>
                                </div>

                                <div class="live-frame-container">
                                    <iframe src="${!isTheater ? `https://lichess.org/tv/${c.id}/frame?theme=metal&bg=${bgParam}` : ''}" data-src="https://lichess.org/tv/${c.id}/frame?theme=metal&bg=${bgParam}" allowtransparency="true" frameborder="0"></iframe>
                                    <div class="live-board-mask" data-channel="${c.id}" title="Click to watch in Fullscreen"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Fullscreen Overlay Modal -->
                    <div id="liveFullscreenModal_${this.uid}" class="live-modal-overlay">
                        <div class="live-modal-content">
                            <div class="live-modal-header">
                                <div class="live-modal-title-wrap">
                                    <i class="fas fa-broadcast-tower" style="color: #ef4444; font-size: 18px;"></i>
                                    <h3 id="modalChannelTitle_${this.uid}">Top Grandmaster Broadcast</h3>
                                    <span class="live-indicator-badge modal-badge-live">
                                        <i class="fas fa-circle" style="font-size: 7px; color: #ef4444;"></i> LIVE
                                    </span>
                                </div>
                                <button type="button" id="btnCloseModal_${this.uid}" class="btn-close-modal" title="Close Fullscreen (Esc)">
                                    <i class="fas fa-times"></i> <span class="btn-close-text">Close (Esc)</span>
                                </button>
                            </div>
                            <div class="live-modal-body">
                                <iframe id="modalLiveFrame_${this.uid}" src="" allowtransparency="true" frameborder="0"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.$container.html(html);
        }

        switchChannel(channelId) {
            this.currentChannel = channelId;
            const channel = this.channels.find(c => c.id === channelId) || this.channels[0];

            // Update pills
            this.$container.find(`.live-pill-tab`).removeClass('active');
            this.$container.find(`.live-pill-tab[data-channel="${channelId}"]`).addClass('active');

            // Update Header texts
            this.$container.find(`#liveMainTitle_${this.uid}`).html(`<i class="fas ${channel.icon}" style="color:${channel.color};"></i> ${channel.name}`);
            this.$container.find(`#liveSubtitle_${this.uid}`).text(channel.desc);
            this.$container.find(`#btnLichessExternal_${this.uid}`).attr('href', `https://lichess.org/tv/${channel.id}`);

            // If in theater mode, update frame immediately
            if (this.viewMode === 'theater') {
                const bgParam = 'dark';
                this.$container.find(`#theaterFrame_${this.uid}`).attr('src', `https://lichess.org/tv/${channel.id}/frame?theme=metal&bg=${bgParam}`);
            } else {
                // In grid mode, scroll smoothly to the card
                const $card = this.$container.find(`.live-channel-card[data-channel="${channelId}"]`);
                if ($card.length) {
                    $('html, body').animate({ scrollTop: $card.offset().top - 80 }, 300);
                }
            }
        }

        setMode(mode) {
            this.viewMode = mode;
            const isTheater = mode === 'theater';
            const bgParam = 'dark';

            this.$container.find(`.btn-mode-toggle`).removeClass('active');
            this.$container.find(`.btn-mode-toggle[data-mode="${mode}"]`).addClass('active');

            if (isTheater) {
                this.$container.find(`#liveGridWrapper_${this.uid}`).hide();
                this.$container.find(`#liveTheaterStage_${this.uid}`).fadeIn(200);
                this.switchChannel(this.currentChannel);
            } else {
                this.$container.find(`#liveTheaterStage_${this.uid}`).hide();
                this.$container.find(`#liveGridWrapper_${this.uid}`).css('display', 'grid').hide().fadeIn(200);

                // Lazy load any grid iframes that don't have src set
                this.$container.find('.live-channel-card iframe').each(function () {
                    const $iframe = $(this);
                    if (!$iframe.attr('src')) {
                        $iframe.attr('src', $iframe.data('src'));
                    }
                });
            }
        }

        openFullscreen(channelId) {
            const channel = this.channels.find(c => c.id === channelId) || this.channels[0];
            const iframeUrl = `https://lichess.org/tv/${channel.id}/frame?theme=metal&bg=dark`;

            this.$container.find(`#modalChannelTitle_${this.uid}`).html(`<i class="fas ${channel.icon}" style="color:${channel.color}; margin-right:8px;"></i> ${channel.name}`);
            this.$container.find(`#modalLiveFrame_${this.uid}`).attr('src', iframeUrl);
            this.$container.find(`#liveFullscreenModal_${this.uid}`).css('display', 'flex').hide().fadeIn(250);
            $('body').css('overflow', 'hidden');
        }

        closeFullscreen() {
            const self = this;
            this.$container.find(`#liveFullscreenModal_${this.uid}`).fadeOut(200, function () {
                $(this).css('display', 'none');
                self.$container.find(`#modalLiveFrame_${self.uid}`).attr('src', '');
                $('body').css('overflow', 'auto');
            });
        }

        bindEvents() {
            const self = this;

            // Channel Pill selection
            this.$container.off('click', '.live-pill-tab').on('click', '.live-pill-tab', function (e) {
                e.preventDefault();
                const channelId = $(this).data('channel');
                if (channelId) {
                    self.switchChannel(channelId);
                }
            });

            // View Mode Toggle (Theater vs Grid)
            this.$container.off('click', '.btn-mode-toggle').on('click', '.btn-mode-toggle', function (e) {
                e.preventDefault();
                const mode = $(this).data('mode');
                if (mode) {
                    self.setMode(mode);
                }
            });

            // Main Fullscreen button (opens active channel in theater)
            this.$container.off('click', `#btnFullscreenMain_${this.uid}`).on('click', `#btnFullscreenMain_${this.uid}`, function (e) {
                e.preventDefault();
                self.openFullscreen(self.currentChannel);
            });

            // Theater Board Click (opens active channel in fullscreen modal, preventing Lichess external navigation)
            this.$container.off('click', `#theaterBoardMask_${this.uid}, .theater-board-mask`).on('click', `#theaterBoardMask_${this.uid}, .theater-board-mask`, function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.openFullscreen(self.currentChannel);
            });

            // Grid card click to fullscreen
            this.$container.off('click', '.live-channel-card, .live-board-mask, .btn-expand-live, .live-channel-header')
                .on('click', '.live-channel-card, .live-board-mask, .btn-expand-live, .live-channel-header', function (e) {
                    e.stopPropagation();
                    const channelId = $(this).data('channel') || $(this).closest('.live-channel-card').data('channel');
                    if (channelId) {
                        self.openFullscreen(channelId);
                    }
                });

            // Close Modal button
            this.$container.off('click', `#btnCloseModal_${this.uid}`).on('click', `#btnCloseModal_${this.uid}`, function (e) {
                e.stopPropagation();
                self.closeFullscreen();
            });

            // Modal overlay click
            this.$container.off('click', `#liveFullscreenModal_${this.uid}`).on('click', `#liveFullscreenModal_${this.uid}`, function (e) {
                if ($(e.target).attr('id') === `liveFullscreenModal_${self.uid}`) {
                    self.closeFullscreen();
                }
            });

            // Escape key
            $(document).off(`keydown.liveModal_${this.uid}`).on(`keydown.liveModal_${this.uid}`, function (e) {
                if (e.key === 'Escape' || e.keyCode === 27) {
                    self.closeFullscreen();
                }
            });
        }
    }

    // Export globally and auto-initialize
    window.MChessLiveGrid = MChessLiveGrid;

    $(document).ready(function () {
        $('#mchessLiveGridContainer, [data-mchess-live]').each(function () {
            if (!$(this).data('mchess-live-initialized')) {
                $(this).data('mchess-live-initialized', true);
                new MChessLiveGrid(this);
            }
        });
    });

})(jQuery);
