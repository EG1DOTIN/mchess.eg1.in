/**
 * Marwadi Chess - About Page Dynamic Quote Loader
 * Randomly selects and displays one of the 32 curated chess quote cards on every visit.
 */
document.addEventListener("DOMContentLoaded", function () {
    var quoteImages = [
        "img/cpcq/id5.webp",
        "img/cpcq/id7.webp",
        "img/cpcq/id8.webp",
        "img/cpcq/id10.webp",
        "img/cpcq/id11.webp",
        "img/cpcq/id12.webp",
        "img/cpcq/id13.webp",
        "img/cpcq/id14.webp",
        "img/cpcq/id15.webp",
        "img/cpcq/id16.webp",
        "img/cpcq/id17.webp",
        "img/cpcq/id18.webp",
        "img/cpcq/id19.webp",
        "img/cpcq/id20.webp",
        "img/cpcq/id21.webp",
        "img/cpcq/id22.webp",
        "img/cpcq/id23.webp",
        "img/cpcq/id24.webp",
        "img/cpcq/id25.webp",
        "img/cpcq/id26.webp",
        "img/cpcq/id27.webp",
        "img/cpcq/id28.webp",
        "img/cpcq/id29.webp",
        "img/cpcq/id30.webp",
        "img/cpcq/id31.webp",
        "img/cpcq/id32.webp",
        "img/cpcq/id33.webp",
        "img/cpcq/id34.webp",
        "img/cpcq/id35.webp",
        "img/cpcq/id38.webp",
        "img/cpcq/id41.webp"
    ];

    var quoteImgElement = document.getElementById("about-dynamic-quote-img");
    var shuffleBtn = document.getElementById("about-quote-shuffle-btn");

    function getRandomQuote(excludeSrc) {
        var filtered = quoteImages.filter(function (src) {
            return src !== excludeSrc;
        });
        var randomIndex = Math.floor(Math.random() * filtered.length);
        return filtered[randomIndex];
    }

    function setQuoteImage() {
        if (!quoteImgElement) return;
        var currentSrc = quoteImgElement.getAttribute("data-current-src") || "";
        var randomSrc = getRandomQuote(currentSrc);
        
        quoteImgElement.style.opacity = "0.3";
        quoteImgElement.src = randomSrc;
        quoteImgElement.setAttribute("data-current-src", randomSrc);
        
        quoteImgElement.onload = function () {
            quoteImgElement.style.opacity = "1";
        };
    }

    // Set initial random quote on page load
    setQuoteImage();

    // Attach click listener for shuffle button
    if (shuffleBtn) {
        shuffleBtn.addEventListener("click", function (e) {
            e.preventDefault();
            setQuoteImage();
        });
    }
});
