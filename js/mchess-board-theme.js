/**
 * @file mchess-board-theme.js
 * @description Centralized Board Themes & Customization Controller for MCHESS.
 * Provides instant theme switching, localStorage persistence, and a modern responsive modal dialog.
 * @project MCHESS Interactive Chess Portal
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'mchess_board_theme';
    const DEFAULT_THEME = 'mchess-slate';

    const THEMES = [
        {
            id: 'mchess-slate',
            name: 'Classic Slate',
            desc: 'Neutral Slate & Charcoal',
            light: '#e6e6e6',
            dark: '#616261',
            border: '#475569'
        },
        {
            id: 'lichess-wood',
            name: 'Lichess Wood',
            desc: 'Warm Sand & Timber',
            light: '#f0d9b5',
            dark: '#b58863',
            border: '#8b5a2b'
        },
        {
            id: 'chessbase-blue',
            name: 'ChessBase Blue',
            desc: 'Pro Blue & Soft Slate',
            light: '#dee3e6',
            dark: '#4e7c99',
            border: '#33536b'
        },
        {
            id: 'tournament-green',
            name: 'Emerald Green',
            desc: 'Tournament Green & Buff',
            light: '#eeeed2',
            dark: '#769656',
            border: '#4a6333'
        },
        {
            id: 'midnight-dark',
            name: 'Midnight Sapphire',
            desc: 'Deep Navy & Ice Blue',
            light: '#cbd5e1',
            dark: '#1e3a8a',
            border: '#0f172a'
        }
    ];

    function getSavedBoardTheme() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && THEMES.some(t => t.id === saved)) {
                return saved;
            }
        } catch (e) {}
        return DEFAULT_THEME;
    }

    function applyBoardTheme(themeId) {
        const theme = THEMES.some(t => t.id === themeId) ? themeId : DEFAULT_THEME;
        document.documentElement.setAttribute('data-board-theme', theme);
        if (document.body) {
            document.body.setAttribute('data-board-theme', theme);
        }

        // Update active class in theme modal if open
        const $modal = document.getElementById('mchessThemeModalOverlay');
        if ($modal) {
            const cards = $modal.querySelectorAll('.mchess-theme-card');
            cards.forEach(card => {
                if (card.getAttribute('data-theme-id') === theme) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        }

        // Dispatch theme change event across DOM
        try {
            const evt = new CustomEvent('mchess:boardthemechanged', { detail: { theme: theme } });
            window.dispatchEvent(evt);
        } catch (err) {}
    }

    // Set initial theme immediately before rendering to eliminate FOUC
    const initialTheme = getSavedBoardTheme();
    document.documentElement.setAttribute('data-board-theme', initialTheme);

    function createThemeModalDOM() {
        if (document.getElementById('mchessThemeModalOverlay')) return;

        const currentTheme = getSavedBoardTheme();
        const overlay = document.createElement('div');
        overlay.id = 'mchessThemeModalOverlay';
        overlay.className = 'mchess-theme-modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'mchessThemeModalTitle');

        let gridHtml = '';
        THEMES.forEach(t => {
            const isActive = (t.id === currentTheme) ? ' active' : '';
            gridHtml += `
                <div class="mchess-theme-card${isActive}" data-theme-id="${t.id}" tabindex="0" role="button" aria-label="Select ${t.name} Theme">
                    <div class="mchess-theme-check-badge"><i class="fas fa-check"></i></div>
                    <div class="mchess-theme-preview-board">
                        <div class="mchess-theme-preview-sq" style="background-color: ${t.light};"></div>
                        <div class="mchess-theme-preview-sq" style="background-color: ${t.dark};"></div>
                        <div class="mchess-theme-preview-sq" style="background-color: ${t.dark};"></div>
                        <div class="mchess-theme-preview-sq" style="background-color: ${t.light};"></div>
                    </div>
                    <div class="mchess-theme-card-name">${t.name}</div>
                    <div class="mchess-theme-card-desc">${t.desc}</div>
                </div>
            `;
        });

        overlay.innerHTML = `
            <div class="mchess-theme-modal-card">
                <div class="mchess-theme-modal-header">
                    <h3 id="mchessThemeModalTitle" class="mchess-theme-modal-title">
                        <i class="fas fa-palette" style="color: #a855f7;"></i> Select Chess Board Theme
                    </h3>
                    <button type="button" class="mchess-theme-modal-close" id="btnCloseThemeModal" aria-label="Close Theme Picker">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="mchess-theme-grid">
                    ${gridHtml}
                </div>
                <div class="mchess-theme-modal-footer">
                    <div class="mchess-theme-modal-hint">
                        <i class="fas fa-magic" style="color: #38bdf8;"></i> Selected theme applies instantly across all boards on MCHESS.
                    </div>
                    <button type="button" class="mchess-theme-modal-btn-done" id="btnDoneThemeModal">
                        Done
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Bind events inside modal
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                window.MChessBoardTheme.closeThemeModal();
            }
        });

        const closeBtn = overlay.querySelector('#btnCloseThemeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                window.MChessBoardTheme.closeThemeModal();
            });
        }

        const doneBtn = overlay.querySelector('#btnDoneThemeModal');
        if (doneBtn) {
            doneBtn.addEventListener('click', function () {
                window.MChessBoardTheme.closeThemeModal();
            });
        }

        const cards = overlay.querySelectorAll('.mchess-theme-card');
        cards.forEach(card => {
            const selectCard = function () {
                const themeId = card.getAttribute('data-theme-id');
                window.MChessBoardTheme.setTheme(themeId);
            };

            card.addEventListener('click', selectCard);
            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectCard();
                }
            });
        });
    }

    // Global Public API
    window.MChessBoardTheme = {
        THEMES: THEMES,
        getTheme: getSavedBoardTheme,
        setTheme: function (themeId) {
            try {
                localStorage.setItem(STORAGE_KEY, themeId);
            } catch (e) {}
            applyBoardTheme(themeId);
        },
        openThemeModal: function () {
            createThemeModalDOM();
            const modal = document.getElementById('mchessThemeModalOverlay');
            if (modal) {
                // Ensure correct card is active
                const currentTheme = getSavedBoardTheme();
                modal.querySelectorAll('.mchess-theme-card').forEach(c => {
                    if (c.getAttribute('data-theme-id') === currentTheme) {
                        c.classList.add('active');
                    } else {
                        c.classList.remove('active');
                    }
                });
                modal.classList.add('active');
            }
        },
        closeThemeModal: function () {
            const modal = document.getElementById('mchessThemeModalOverlay');
            if (modal) {
                modal.classList.remove('active');
            }
        }
    };

    // DOM Ready Initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOnReady);
    } else {
        initOnReady();
    }

    function initOnReady() {
        applyBoardTheme(getSavedBoardTheme());

        // Universal click listener for all theme buttons with delegation
        document.addEventListener('click', function (e) {
            const themeBtn = e.target.closest('.btn-board-theme, [data-action="open-board-theme"]');
            if (themeBtn) {
                e.preventDefault();
                window.MChessBoardTheme.openThemeModal();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                window.MChessBoardTheme.closeThemeModal();
            }
        });
    }

})();
