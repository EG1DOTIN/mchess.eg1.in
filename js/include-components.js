/**
 * @file include-components.js
 * @description Dynamic AJAX component loader for header, navigation menu, and footer.
 * Manages responsive toggle menu handlers, sticky navigation scrolling, and active link highlights.
 * @project MCHESS Interactive Chess Portal
 */

/**
 * Loads HTML templates (header, menu, footer) via AJAX and appends them into DOM placeholders.
 */
function initializeComponents() {
    // Load header template
    $.get('components/header.html', function (data) {
        var cleanData = typeof data === 'string' ? data.replace(/<script[\s\S]*?<\/script>/gi, '') : data;
        $('#header-placeholder').html(cleanData);
        if (typeof window.initializeNotifications === 'function') {
            window.initializeNotifications();
        }
        initializeHeaderRefresh();
    });

    // Load menu template & initialize navigation handlers directly after insertion
    $.get('components/menu.html', function (data) {
        var cleanData = typeof data === 'string' ? data.replace(/<script[\s\S]*?<\/script>/gi, '') : data;
        $('#menu-placeholder').html(cleanData);
        initializeResponsiveMenu();
        initializeNavigation();
        initializeFixedNav();
    });

    // Load footer template
    $.get('components/footer.html', function (data) {
        var cleanData = typeof data === 'string' ? data.replace(/<script[\s\S]*?<\/script>/gi, '') : data;
        $('#footer-placeholder').html(cleanData);
        initializeBackToTop();
    });

    // Initialize visitor analytics tracking
    initializeVisitorTracker();

    // Dynamically load theme engine
    if (!document.querySelector('script[src*="mchess-theme.js"]')) {
        var themeScript = document.createElement('script');
        themeScript.src = 'js/mchess-theme.js';
        document.body.appendChild(themeScript);
    }

    // Dynamically load board theme stylesheet
    if (!document.querySelector('link[href*="mchess-board-theme.css"]')) {
        var boardThemeCss = document.createElement('link');
        boardThemeCss.rel = 'stylesheet';
        boardThemeCss.href = 'css/mchess-board-theme.css';
        document.head.appendChild(boardThemeCss);
    }

    // Dynamically load board theme engine
    if (!document.querySelector('script[src*="mchess-board-theme.js"]')) {
        var boardThemeScript = document.createElement('script');
        boardThemeScript.src = 'js/mchess-board-theme.js';
        document.body.appendChild(boardThemeScript);
    }

    // Dynamically load in-site notification engine
    if (!document.querySelector('script[src*="notifications.js"]')) {
        var notifScript = document.createElement('script');
        notifScript.src = 'js/notifications.js';
        document.body.appendChild(notifScript);
    }
}

/**
 * Dynamically loads visitor analytics tracker
 */
function initializeVisitorTracker() {
    if (!document.querySelector('script[src*="visitor-tracker.js"]')) {
        var script = document.createElement('script');
        script.src = 'js/visitor-tracker.js';
        script.async = true;
        document.body.appendChild(script);
    }
}

/**
 * Initializes responsive navigation menu behavior for mobile and desktop screens.
 */
function initializeResponsiveMenu() {
    var ww = document.body.clientWidth;
    $(".nav li a").each(function () {
        if ($(this).next().length > 0) {
            $(this).addClass("parent");
        }
    });

    $(".toggleMenu").off('click').on('click', function (e) {
        e.preventDefault();
        $(this).toggleClass("active");
        $(".navbar .menu").toggle();
        $(".nav").toggle();
    });

    adjustMenu();

    $(window).off('resize.mchessMenu orientationchange.mchessMenu').on('resize.mchessMenu orientationchange.mchessMenu', function () {
        ww = document.body.clientWidth;
        adjustMenu();
    });

    /**
     * Adjusts navigation layout based on viewport breakpoint width (920px).
     */
    function adjustMenu() {
        ww = document.body.clientWidth;
        if (ww < 920) {
            $(".toggleMenu").css("display", "block");
            if (!$(".toggleMenu").hasClass("active")) {
                $(".navbar .menu").hide();
                $(".nav").hide();
            } else {
                $(".navbar .menu").show();
                $(".nav").show();
            }
            $(".nav li").off('mouseenter mouseleave');
            $(".nav li a.parent").off('click').on('click', function (e) {
                e.preventDefault();
                $(this).parent("li").toggleClass("hover");
            });
        }
        else if (ww >= 920) {
            $(".toggleMenu").css("display", "none");
            $(".navbar .menu").show();
            $(".nav").show();
            $(".nav li").removeClass("hover");
            $(".nav li a").off('click');
            $(".nav li").off('mouseenter mouseleave').on('mouseenter mouseleave', function () {
                $(this).toggleClass('hover');
            });
        }
    }
}

/**
 * Automatically detects current HTML filename and highlights the corresponding nav item.
 */
function initializeNavigation() {
    $(".nav li a").off('click.navActive').on('click.navActive', function () {
        $(this).parent().addClass("active");
        $(this).parent().siblings().removeClass("active");
    });

    var rawFilename = window.location.pathname.split('/').pop() || 'index.html';
    if (!rawFilename || rawFilename === '') rawFilename = 'index.html';

    $(".nav a").each(function () {
        var href = $(this).attr('href');
        if (href) {
            var hrefClean = href.split('?')[0].split('#')[0];
            if (hrefClean === rawFilename) {
                $(this).closest("li").addClass("active");
                $(this).parents(".nav > li").addClass("active");
            }
        }
    });
}

/**
 * Configures fixed/sticky navigation bar on page scroll.
 */
function initializeFixedNav() {
    var nav = $(".navbar");
    var navPlaceholder = $('<div class="nav-placeholder" style="display: none;"></div>');
    nav.before(navPlaceholder);

    function updateFixedNav() {
        if (window.innerWidth >= 768 && $(window).scrollTop() > 117) {
            nav.addClass("f-nav");
            navPlaceholder.height(nav.outerHeight()).show();
        } else {
            nav.removeClass("f-nav");
            navPlaceholder.hide();
        }
    }

    $(window).on('scroll.fixedNav resize.fixedNav orientationchange.fixedNav', updateFixedNav);
    updateFixedNav();
}

/**
 * Configures smart bidirectional floating scroll button (Scroll Down to Bottom / Scroll Up to Top).
 * Automatically adapts arrow direction, tooltip, and scrolling target based on page scroll position.
 */
function initializeBackToTop() {
    var $btn = $('#backToTopBtn');
    if (!$btn.length) return;

    var currentDirection = 'down';

    function updateScrollState() {
        var scrollTop = $(window).scrollTop();
        var docHeight = $(document).height();
        var winHeight = $(window).height();
        var maxScroll = docHeight - winHeight;

        // If page has negligible scrollable content, hide button
        if (maxScroll <= 80) {
            $btn.fadeOut(200);
            return;
        }

        // Show button when page has scrollable content
        if ($btn.is(':hidden')) {
            $btn.css('display', 'inline-flex').hide().fadeIn(200);
        }

        // Dynamic threshold: switch to UP after scrolling 300px or past 35% of max scroll
        var threshold = Math.min(300, maxScroll * 0.35);

        if (scrollTop < threshold) {
            if (currentDirection !== 'down') {
                currentDirection = 'down';
                $btn.attr('data-direction', 'down')
                    .attr('title', 'Scroll to Bottom')
                    .attr('aria-label', 'Scroll to Bottom');
                $btn.find('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
            }
        } else {
            if (currentDirection !== 'up') {
                currentDirection = 'up';
                $btn.attr('data-direction', 'up')
                    .attr('title', 'Scroll to Top')
                    .attr('aria-label', 'Scroll to Top');
                $btn.find('i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
            }
        }
    }

    // Scroll click handler
    $btn.off('click.smartScroll').on('click.smartScroll', function (e) {
        e.preventDefault();
        var dir = $btn.attr('data-direction') || currentDirection;
        if (dir === 'down') {
            var targetScroll = $(document).height() - $(window).height();
            $('html, body').stop().animate({ scrollTop: targetScroll }, 450);
        } else {
            $('html, body').stop().animate({ scrollTop: 0 }, 450);
        }
    });

    // Window scroll and resize listeners
    $(window).off('scroll.smartScroll resize.smartScroll orientationchange.smartScroll')
             .on('scroll.smartScroll resize.smartScroll orientationchange.smartScroll', function () {
                 updateScrollState();
             });

    // Initial state evaluation
    updateScrollState();
}

/**
 * Initializes the 1-click App Refresh & Cache Purge button
 * Detects active live games, provides safety confirmation, thoroughly purges DataCache,
 * localStorage data caches, CacheStorage API, and reloads with cache-busting timestamp.
 */
function initializeHeaderRefresh() {
    $(document).off('click.appRefresh', '#appRefreshBtn').on('click.appRefresh', '#appRefreshBtn', function (e) {
        e.preventDefault();

        // 1. Check if an active online or engine game is currently ongoing
        var isGameActive = false;

        // Check P2P online game active
        try {
            var p2pSession = sessionStorage.getItem('mchess_active_match') || localStorage.getItem('mchess_active_match');
            if (p2pSession) {
                var parsed = JSON.parse(p2pSession);
                if (parsed && parsed.matchActive) {
                    isGameActive = true;
                }
            }
        } catch (err) {}

        // Check Engine active game
        if (!isGameActive && window.$) {
            var $engine = $('#mchessEngineBoardContainer, [data-mchess-engine]').first();
            if ($engine.length > 0) {
                var inst = $engine.data('mchess-instance');
                if (inst && inst.chess && !inst.chess.game_over() && inst.chess.history().length > 0 && !inst.gameSaved) {
                    isGameActive = true;
                }
            }
        }

        // 2. Warn the player if mid-game
        if (isGameActive) {
            var confirmed = window.confirm(
                "⚠️ You have a live chess game in progress!\n\nRefreshing will reload the latest app updates and reconnect you to your match.\n\nDo you want to proceed?"
            );
            if (!confirmed) return;
        }

        // Animate the icon
        var $icon = $('#appRefreshIcon');
        if ($icon.length) {
            $icon.addClass('fa-spin');
        }

        // 3. Purge DataCache memory & persistent localStorage data caches
        try {
            if (window.DataCache && typeof window.DataCache.clearCache === 'function') {
                window.DataCache.clearCache();
            }

            // Keys to safely preserve:
            var preservedKeys = [
                'mchess_theme',
                'mchess_board_theme',
                'mchess_player_name',
                'mchess_saved_games',
                'mchess_session_peer_id',
                'mchess_active_match',
                'mchess_read_notifications_v1'
            ];

            // Selective purge of data cache keys
            var keysToRemove = [];
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key && !preservedKeys.includes(key)) {
                    if (key.indexOf('cache') !== -1 || key.indexOf('blog') !== -1 || key.indexOf('mchess_data') !== -1) {
                        keysToRemove.push(key);
                    }
                }
            }
            keysToRemove.forEach(function (k) {
                try { localStorage.removeItem(k); } catch (e) {}
            });
            console.log("[MChess Refresh] Cleared localStorage data caches:", keysToRemove);
        } catch (storageErr) {
            console.warn("[MChess Refresh] LocalStorage cache purge warning:", storageErr);
        }

        // 4. Purge CacheStorage API caches if supported
        var clearCachePromise = Promise.resolve();
        if ('caches' in window) {
            clearCachePromise = caches.keys().then(function (names) {
                return Promise.all(
                    names.map(function (name) {
                        return caches.delete(name);
                    })
                );
            }).catch(function (err) {
                console.warn("[MChess Refresh] CacheStorage clear warning:", err);
            });
        }

        // 5. Perform cache-bypassing reload with a unique timestamp query parameter
        clearCachePromise.finally(function () {
            try {
                var currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('_r', Date.now());
                window.location.href = currentUrl.toString();
            } catch (urlErr) {
                window.location.reload(true);
            }
        });
    });
}

// Trigger component initialization on DOM ready
$(document).ready(function () {
    initializeComponents();
});
