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
    $.get('components/header.html', function(data) {
        $('#header-placeholder').html(data);
    });
    
    // Load menu template & initialize navigation handlers after insertion
    $.get('components/menu.html', function(data) {
        $('#menu-placeholder').html(data);
        
        setTimeout(function() {
            initializeResponsiveMenu();
            initializeNavigation();
            initializeFixedNav();
        }, 100);
    });

    // Load footer template
    $.get('components/footer.html', function(data) {
        $('#footer-placeholder').html(data);
        setTimeout(initializeBackToTop, 100);
    });

    // Initialize visitor analytics tracking
    initializeVisitorTracker();
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
    $(".nav li a").each(function() {
        if ($(this).next().length > 0) {
            $(this).addClass("parent");
        }
    });
    $(".toggleMenu").click(function(e) {
        e.preventDefault();
        $(this).toggleClass("active");
        $(".nav").toggle();
    });
    adjustMenu();
    $(window).bind('resize orientationchange', function() {
        ww = document.body.clientWidth;
        adjustMenu();
    });

    /**
     * Adjusts navigation layout based on viewport breakpoint width (920px).
     */
    function adjustMenu() {
        ww = document.body.clientWidth;
        if (ww < 920) {
            $(".toggleMenu").css("display", "inline-block");
            if (!$(".toggleMenu").hasClass("active")) {
                $(".nav").hide();
            } else {
                $(".nav").show();
            }
            $(".nav li").unbind('mouseenter mouseleave');
            $(".nav li a.parent").unbind('click').bind('click', function(e) {
                e.preventDefault();
                $(this).parent("li").toggleClass("hover");
            });
        } 
        else if (ww >= 920) {
            $(".toggleMenu").css("display", "none");
            $(".nav").show();
            $(".nav li").removeClass("hover");
            $(".nav li a").unbind('click');
            $(".nav li").unbind('mouseenter mouseleave').bind('mouseenter mouseleave', function() {
                $(this).toggleClass('hover');
            });
        }
    }
}

/**
 * Automatically detects current HTML filename and highlights the corresponding nav item.
 */
function initializeNavigation() {
    $(".nav li a").click(function () {
        $(this).parent().addClass("active");
        $(this).parent().siblings().removeClass("active");
    });
    var url = window.location.href;
    var filename = url.substring(url.lastIndexOf('/')+1);
    if(filename === '') filename = 'index.html';

    $(".nav a").each(function () {
        var href = $(this).attr('href');
        if (href && href === filename) {
            $(this).closest("li").addClass("active");
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

    $(window).scroll(function () {
        if ($(this).scrollTop() > 117) {
            nav.addClass("f-nav");
            navPlaceholder.height(nav.outerHeight()).show();
        } else {
            nav.removeClass("f-nav");
            navPlaceholder.hide();
        }
    });
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
$(document).ready(function() {
    initializeComponents();
});

