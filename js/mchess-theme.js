/**
 * @file mchess-theme.js
 * @description Centralized Light / Dark Theme Engine for MCHESS.
 * Manages data-theme attribute on documentElement, localStorage persistence, and button state.
 * @project MCHESS Interactive Chess Portal
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'mchess_theme';

    function getSavedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY) || 'light';
        } catch (e) {
            return 'light';
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Also add body class if needed
        if (theme === 'dark') {
            document.body && document.body.classList.add('dark-theme');
            document.body && document.body.classList.remove('light-theme');
        } else {
            document.body && document.body.classList.add('light-theme');
            document.body && document.body.classList.remove('dark-theme');
        }

        updateButtonUI(theme);
    }

    function updateButtonUI(theme) {
        const $btn = $('#themeToggleBtn');
        const $icon = $('#themeToggleIcon');
        const $text = $('#themeToggleText');

        if ($btn.length) {
            if (theme === 'dark') {
                $icon.attr('class', 'fas fa-sun').css('color', '#f59e0b');
                $text.text('Light Mode');
                $btn.css('background', 'linear-gradient(135deg, #d97706 0%, #b45309 100%)');
            } else {
                $icon.attr('class', 'fas fa-moon').css('color', '#cbd5e1');
                $text.text('Dark Mode');
                $btn.css('background', 'linear-gradient(135deg, #334155 0%, #1e293b 100%)');
            }
        }
    }

    // Apply theme immediately before render to avoid flickering
    const currentTheme = getSavedTheme();
    document.documentElement.setAttribute('data-theme', currentTheme);

    window.MChessTheme = {
        getTheme: getSavedTheme,
        setTheme: function (theme) {
            try {
                localStorage.setItem(STORAGE_KEY, theme);
            } catch (e) {}
            applyTheme(theme);
        },
        toggleTheme: function () {
            const next = (getSavedTheme() === 'dark') ? 'light' : 'dark';
            window.MChessTheme.setTheme(next);
        }
    };

    $(document).ready(function () {
        applyTheme(getSavedTheme());

        $(document).on('click', '#themeToggleBtn', function (e) {
            e.preventDefault();
            window.MChessTheme.toggleTheme();
        });
    });

})();
