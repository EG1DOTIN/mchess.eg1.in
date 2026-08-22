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
 * Configures floating back to top button behavior and scroll visibility
 */
function initializeBackToTop() {
    $(window).scroll(function () {
        if ($(this).scrollTop() > 250) {
            $('#backToTopBtn').fadeIn();
        } else {
            $('#backToTopBtn').fadeOut();
        }
    });

    $('#backToTopBtn').click(function (e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 400);
    });
}

// Trigger component initialization on DOM ready
$(document).ready(function () {
    initializeComponents();
});
