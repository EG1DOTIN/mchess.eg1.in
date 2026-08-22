/**
 * Marwadi Chess - About Page Dynamic Quote Loader
 * Randomly selects and displays one of the 32 curated chess quote cards on every visit.
 */
document.addEventListener("DOMContentLoaded", function () {
    var quoteImages = [
        "cpcq/id5.webp",
        "cpcq/id7.webp",
        "cpcq/id8.webp",
        "cpcq/id10.webp",
        "cpcq/id11.webp",
        "cpcq/id12.webp",
        "cpcq/id13.webp",
        "cpcq/id14.webp",
        "cpcq/id15.webp",
        "cpcq/id16.webp",
        "cpcq/id17.webp",
        "cpcq/id18.webp",
        "cpcq/id19.webp",
        "cpcq/id20.webp",
        "cpcq/id21.webp",
        "cpcq/id22.webp",
        "cpcq/id23.webp",
        "cpcq/id24.webp",
        "cpcq/id25.webp",
        "cpcq/id26.webp",
        "cpcq/id27.webp",
        "cpcq/id28.webp",
        "cpcq/id29.webp",
        "cpcq/id30.webp",
        "cpcq/id31.webp",
        "cpcq/id32.webp",
        "cpcq/id33.webp",
        "cpcq/id34.webp",
        "cpcq/id35.webp",
        "cpcq/id38.webp",
        "cpcq/id41.webp"
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
