/**
 * @file mchess-live-board.js
 * @description Multi-Channel Live Games Broadcast Component for MCHESS with Fullscreen Expansion.
 * Streams real-time live games across all 6 Lichess TV channels (Best/Top GM, Blitz, Rapid, Bullet, Classical, UltraBullet)
 * with click-anywhere Fullscreen Mode.
 * @project MCHESS Interactive Chess Portal
 */

(function ($) {
    'use strict';

    class MChessLiveGrid {
        constructor(containerEl, options) {
            this.$container = $(containerEl);
            this.channels = [
                { id: 'best', name: 'Top Grandmaster Broadcast', icon: 'fa-trophy', color: '#d4af37', badge: 'TOP GM' },
                { id: 'blitz', name: 'Live Blitz Championship', icon: 'fa-bolt', color: '#eab308', badge: 'BLITZ' },
                { id: 'rapid', name: 'Live Rapid Championship', icon: 'fa-stopwatch', color: '#3b82f6', badge: 'RAPID' },
                { id: 'bullet', name: 'Live Bullet Speed Channel', icon: 'fa-fire', color: '#ef4444', badge: 'BULLET' },
                { id: 'classical', name: 'Live Classical Tournament', icon: 'fa-chess-king', color: '#10b981', badge: 'CLASSICAL' },
                { id: 'ultraBullet', name: 'Live UltraBullet Speed', icon: 'fa-rocket', color: '#ec4899', badge: 'ULTRA BULLET' }
            ];

            this.activeFilter = 'all';
            this.initLayout();
            this.bindEvents();
        }

        initLayout() {
            if (this.$container.children().length > 0) return;

            const html = `
                <div class="pgn-viewer-container" style="max-width: 100%;">
                    <div class="demo-badge-header" style="flex-wrap: wrap; gap: 15px; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 class="demo-title" style="margin: 0;">
                                <i class="fas fa-broadcast-tower" style="color: #ef4444;"></i>
                                Live Multi-Channel Chess Broadcasts (6 Channels)
                            </h2>
                            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">
                                <strong>Click any board</strong> to expand into Full Screen Mode
                            </p>
                        </div>

                        <div style="display:flex; gap:8px; flex-wrap: wrap;">
                            <span class="tech-pill" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);">
                                <i class="fas fa-signal"></i> REAL-TIME MULTI-STREAM
                            </span>
                        </div>
                    </div>

                    <!-- Channel Filter Tabs -->
                    <div class="channel-filter-bar">
                        <button class="filter-tab active" data-filter="all">
                            <i class="fas fa-th-large" style="margin-right: 6px;"></i> All 6 Channels
                        </button>
                        ${this.channels.map(c => `
                            <button class="filter-tab" data-filter="${c.id}">
                                <i class="fas ${c.icon}" style="color:${c.color}; margin-right: 6px;"></i> ${c.badge}
                            </button>
                        `).join('')}
                    </div>

                    <!-- 2 x 3 Grid for 6 Live TV Channels -->
                    <div id="liveGridWrapper" class="live-channels-grid">
                        ${this.channels.map(c => `
                            <div class="live-channel-card" data-channel="${c.id}">
                                <div class="live-channel-header" style="border-top-color: ${c.color};">
                                    <div class="live-channel-title">
                                        <i class="fas ${c.icon}" style="color:${c.color}; font-size: 14px;"></i>
                                        <span>${c.name}</span>
                                    </div>
                                    <div class="live-channel-actions">
                                        <button class="btn-expand-live" data-channel="${c.id}" title="Watch Fullscreen">
                                            <i class="fas fa-expand"></i> Fullscreen
                                        </button>
                                        <span class="live-indicator-badge">
                                            <i class="fas fa-circle" style="font-size: 7px; color: #ef4444;"></i> LIVE
                                        </span>
                                    </div>
                                </div>

                                <div class="live-frame-container">
                                    <iframe src="https://lichess.org/tv/${c.id}/frame?theme=metal&bg=dark" allowtransparency="true" frameborder="0"></iframe>
                                    <div class="live-board-mask" data-channel="${c.id}" title="Click to watch in Fullscreen"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Fullscreen Overlay Modal -->
                    <div id="liveFullscreenModal" class="live-modal-overlay">
                        <div class="live-modal-content">
                            <div class="live-modal-header">
                                <div class="live-modal-title-wrap">
                                    <i class="fas fa-broadcast-tower" style="color: #ef4444; font-size: 18px;"></i>
                                    <h3 id="modalChannelTitle">Top Grandmaster Broadcast</h3>
                                    <span class="live-indicator-badge modal-badge-live">
                                        <i class="fas fa-circle" style="font-size: 7px; color: #ef4444;"></i> LIVE
                                    </span>
                                </div>
                                <button id="btnCloseModal" title="Close Fullscreen (Esc)">
                                    <i class="fas fa-times"></i> <span class="btn-close-text">Close (Esc)</span>
                                </button>
                            </div>
                            <div class="live-modal-body">
                                <iframe id="modalLiveFrame" src="" allowtransparency="true" frameborder="0"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.$container.html(html);
        }

        openFullscreen(channelId) {
            const channel = this.channels.find(c => c.id === channelId) || this.channels[0];
            const iframeUrl = `https://lichess.org/tv/${channel.id}/frame?theme=metal&bg=dark`;

            this.$container.find('#modalChannelTitle').html(`<i class="fas ${channel.icon}" style="color:${channel.color}; margin-right:8px;"></i> ${channel.name}`);
            this.$container.find('#modalLiveFrame').attr('src', iframeUrl);
            this.$container.find('#liveFullscreenModal').css('display', 'flex').hide().fadeIn(250);
            $('body').css('overflow', 'hidden');
        }

        closeFullscreen() {
            this.$container.find('#liveFullscreenModal').fadeOut(200, function () {
                $(this).css('display', 'none');
                $('#modalLiveFrame').attr('src', '');
                $('body').css('overflow', 'auto');
            });
        }

        bindEvents() {
            const self = this;

            // Click anywhere on card, board mask, header or fullscreen button to open Fullscreen
            this.$container.off('click', '.live-channel-card, .live-board-mask, .btn-expand-live, .live-channel-header')
                .on('click', '.live-channel-card, .live-board-mask, .btn-expand-live, .live-channel-header', function (e) {
                    e.stopPropagation();
                    const channelId = $(this).data('channel') || $(this).closest('.live-channel-card').data('channel');
                    if (channelId) {
                        self.openFullscreen(channelId);
                    }
                });

            // Close button click
            $(document).off('click', '#btnCloseModal').on('click', '#btnCloseModal', function (e) {
                e.stopPropagation();
                self.closeFullscreen();
            });

            // Overlay click to close
            $(document).off('click', '#liveFullscreenModal').on('click', '#liveFullscreenModal', function (e) {
                if ($(e.target).attr('id') === 'liveFullscreenModal') {
                    self.closeFullscreen();
                }
            });

            // Escape key press to close modal
            $(document).off('keydown.liveModal').on('keydown.liveModal', function (e) {
                if (e.key === 'Escape' || e.keyCode === 27) {
                    self.closeFullscreen();
                }
            });

            // Channel filter tabs
            this.$container.off('click', '.filter-tab').on('click', '.filter-tab', function (e) {
                e.stopPropagation();
                const filter = $(this).data('filter');
                self.activeFilter = filter;

                self.$container.find('.filter-tab').removeClass('active');
                $(this).addClass('active');

                if (filter === 'all') {
                    self.$container.find('.live-channel-card').fadeIn(300);
                } else {
                    self.$container.find('.live-channel-card').hide();
                    self.$container.find(`.live-channel-card[data-channel="${filter}"]`).fadeIn(300);
                }
            });
        }
    }

    // Global Export & Auto-init MChessLiveGrid
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
