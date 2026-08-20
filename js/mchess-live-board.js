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
                    <div class="channel-filter-bar" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; padding: 12px; background: rgba(30, 41, 59, 0.6); border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
                        <button class="filter-tab active" data-filter="all" style="padding: 8px 16px; border-radius: 6px; border: none; background: #2563eb; color: #fff; font-weight: bold; cursor: pointer;">
                            <i class="fas fa-th-large"></i> All 6 Channels
                        </button>
                        ${this.channels.map(c => `
                            <button class="filter-tab" data-filter="${c.id}" style="padding: 8px 16px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: rgba(15, 23, 42, 0.8); color: #cbd5e1; font-weight: 500; cursor: pointer;">
                                <i class="fas ${c.icon}" style="color:${c.color}; margin-right: 6px;"></i> ${c.badge}
                            </button>
                        `).join('')}
                    </div>

                    <!-- 2 x 3 Grid for 6 Live TV Channels -->
                    <div id="liveGridWrapper" class="row" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
                        ${this.channels.map(c => `
                            <div class="col-lg-4 col-md-6 col-sm-12 live-channel-card" data-channel="${c.id}" style="flex: 1 1 360px; max-width: 480px; display: block; position: relative;">
                                <div class="game-meta-card" style="margin-bottom: 10px; border-left: 4px solid ${c.color}; background: #1e293b; padding: 10px 14px; cursor: pointer;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-weight: bold; font-size: 14px; color: #f8fafc;">
                                            <i class="fas ${c.icon}" style="color:${c.color}; margin-right: 8px;"></i> ${c.name}
                                        </span>
                                        <div style="display:flex; gap:6px; align-items:center;">
                                            <button class="btn-expand-live" data-channel="${c.id}" title="Watch Fullscreen" style="background: rgba(37, 99, 235, 0.3); border: 1px solid #3b82f6; color: #60a5fa; font-size: 11px; padding: 3px 8px; border-radius: 4px; cursor: pointer;">
                                                <i class="fas fa-expand"></i> Fullscreen
                                            </button>
                                            <span class="result-badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 3px 8px; font-size: 11px;">
                                                <i class="fas fa-circle" style="font-size: 7px; color: #ef4444; margin-right: 4px;"></i> LIVE
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div class="live-frame-container" style="width: 100%; height: 460px; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.4); background: #161512; border: 1px solid rgba(255,255,255,0.1); position: relative; cursor: pointer;">
                                    <iframe src="https://lichess.org/tv/${c.id}/frame?theme=metal&bg=dark" allowtransparency="true" frameborder="0" style="width: 100%; height: 100%; border: none; pointer-events: none;"></iframe>
                                    <div class="live-board-mask" data-channel="${c.id}" title="Click to watch in Fullscreen" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; cursor: pointer; background: rgba(0,0,0,0.01);"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Fullscreen Overlay Modal -->
                    <div id="liveFullscreenModal" class="live-modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.95); z-index: 99999; justify-content: center; align-items: center; padding: 20px;">
                        <div class="live-modal-content" style="position: relative; width: 92%; max-width: 960px; height: 88vh; background: #1e293b; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 60px rgba(0,0,0,0.85); border: 1px solid rgba(255,255,255,0.15);">
                            <div class="live-modal-header" style="padding: 14px 20px; background: #0f172a; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <div style="display:flex; align-items:center; gap: 12px;">
                                    <i class="fas fa-broadcast-tower" style="color: #ef4444; font-size: 20px;"></i>
                                    <h3 id="modalChannelTitle" style="color: #f8fafc; margin: 0; font-size: 18px; font-weight: bold;">Top Grandmaster Broadcast</h3>
                                    <span class="result-badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 4px 10px; font-size: 12px;">
                                        <i class="fas fa-circle" style="font-size: 8px; color: #ef4444;"></i> LIVE FULLSCREEN
                                    </span>
                                </div>
                                <button id="btnCloseModal" style="background: #ef4444; border: none; color: #fff; font-size: 14px; font-weight: bold; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                                    <i class="fas fa-times"></i> Close Fullscreen (Esc)
                                </button>
                            </div>
                            <div class="live-modal-body" style="flex: 1; position: relative; background: #161512;">
                                <iframe id="modalLiveFrame" src="" allowtransparency="true" frameborder="0" style="width: 100%; height: 100%; border: none;"></iframe>
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

            // Click anywhere on board mask or card header to open Fullscreen
            this.$container.find('.live-board-mask, .btn-expand-live, .game-meta-card').on('click', function (e) {
                e.stopPropagation();
                const channelId = $(this).data('channel') || $(this).closest('.live-channel-card').data('channel');
                if (channelId) {
                    self.openFullscreen(channelId);
                }
            });

            // Close button click
            this.$container.find('#btnCloseModal').on('click', () => self.closeFullscreen());

            // Overlay click to close
            this.$container.find('#liveFullscreenModal').on('click', function (e) {
                if ($(e.target).attr('id') === 'liveFullscreenModal') {
                    self.closeFullscreen();
                }
            });

            // Escape key press to close modal
            $(document).on('keydown', function (e) {
                if (e.key === 'Escape' || e.keyCode === 27) {
                    self.closeFullscreen();
                }
            });

            // Channel filter tabs
            this.$container.find('.filter-tab').off('click').on('click', function () {
                const filter = $(this).data('filter');
                self.activeFilter = filter;

                self.$container.find('.filter-tab').removeClass('active').css({
                    'background': 'rgba(15, 23, 42, 0.8)',
                    'color': '#cbd5e1'
                });
                $(this).addClass('active').css({
                    'background': '#2563eb',
                    'color': '#fff'
                });

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
