/**
 * Marwadi Chess - About Page Script (js/about.js)
 * Manages dynamic quote studio, text attribution, copy-to-clipboard,
 * web sharing, and interactive widgets.
 */

document.addEventListener("DOMContentLoaded", function () {
    // Curated quote dataset with accessible text, author, and matching card images
    var curatedQuotes = [
        {
            img: "img/cpcq/id5.webp",
            quote: "Chess is the struggle against the error.",
            author: "Johannes Zukertort"
        },
        {
            img: "img/cpcq/id7.webp",
            quote: "Every chess master was once a beginner.",
            author: "Irving Chernev"
        },
        {
            img: "img/cpcq/id8.webp",
            quote: "The blunders are all there on the board, waiting to be made.",
            author: "Savielly Tartakower"
        },
        {
            img: "img/cpcq/id10.webp",
            quote: "Chess is not just a game; it is an art, a science, and a sport.",
            author: "Anatoly Karpov"
        },
        {
            img: "img/cpcq/id11.webp",
            quote: "A good player is always lucky.",
            author: "Jose Raul Capablanca"
        },
        {
            img: "img/cpcq/id12.webp",
            quote: "When you see a good move, look for a better one.",
            author: "Emanuel Lasker"
        },
        {
            img: "img/cpcq/id13.webp",
            quote: "Tactics is knowing what to do when there is something to do; strategy is knowing what to do when there is nothing to do.",
            author: "Savielly Tartakower"
        },
        {
            img: "img/cpcq/id14.webp",
            quote: "Chess holds its master in its own bonds, shackling the mind and brain.",
            author: "Albert Einstein"
        },
        {
            img: "img/cpcq/id15.webp",
            quote: "No price is too great for the scalp of a King.",
            author: "Bobby Fischer"
        },
        {
            img: "img/cpcq/id16.webp",
            quote: "Even a poor plan is better than no plan at all.",
            author: "Mikhail Chigorin"
        },
        {
            img: "img/cpcq/id17.webp",
            quote: "Play the opening like a book, the middle game like a magician, and the endgame like a machine.",
            author: "Rudolf Spielmann"
        },
        {
            img: "img/cpcq/id18.webp",
            quote: "Chess is life in miniature. Chess is a struggle, chess is battles.",
            author: "Garry Kasparov"
        },
        {
            img: "img/cpcq/id19.webp",
            quote: "One bad move nullifies forty good ones.",
            author: "Bernhard Horwitz"
        },
        {
            img: "img/cpcq/id20.webp",
            quote: "Pawns are the soul of chess.",
            author: "Francois-Andre Danican Philidor"
        },
        {
            img: "img/cpcq/id21.webp",
            quote: "In chess, knowledge is a weapon. You have to conquer that weapon.",
            author: "Viswanathan Anand"
        },
        {
            img: "img/cpcq/id22.webp",
            quote: "A sacrifice is best refuted by accepting it.",
            author: "Wilhelm Steinitz"
        },
        {
            img: "img/cpcq/id25.webp",
            quote: "There are two types of sacrifices: correct ones, and mine.",
            author: "Mikhail Tal"
        },
        {
            img: "img/cpcq/id30.webp",
            quote: "Chess doesn't drive people mad; it keeps mad people sane.",
            author: "Bill Hartston"
        },
        {
            img: "img/cpcq/id35.webp",
            quote: "The pawn is the most humble chess piece, but it can become the most powerful.",
            author: "Chess Wisdom"
        },
        {
            img: "img/cpcq/id41.webp",
            quote: "Strategy requires thought, tactics require observation.",
            author: "Max Euwe"
        }
    ];

    var quoteImgElement = document.getElementById("demo-quote-img");
    var quoteTextElement = document.getElementById("demo-quote-text");
    var quoteAuthorElement = document.getElementById("demo-quote-author");
    var shuffleBtn = document.getElementById("demo-quote-shuffle-btn");
    var copyBtn = document.getElementById("demo-quote-copy-btn");
    var shareBtn = document.getElementById("demo-quote-share-btn");

    var currentQuote = null;

    function getRandomQuote(excludeImg) {
        var filtered = curatedQuotes.filter(function (item) {
            return !excludeImg || item.img !== excludeImg;
        });
        var randomIndex = Math.floor(Math.random() * filtered.length);
        return filtered[randomIndex];
    }

    function renderQuote(quoteObj) {
        if (!quoteObj) return;
        currentQuote = quoteObj;

        if (quoteImgElement) {
            quoteImgElement.style.opacity = "0.2";
            quoteImgElement.style.transform = "scale(0.98)";
            
            var tempImg = new Image();
            tempImg.src = quoteObj.img;
            tempImg.onload = function () {
                quoteImgElement.src = quoteObj.img;
                quoteImgElement.alt = '"' + quoteObj.quote + '" by ' + quoteObj.author + ' | Marwadi Chess';
                quoteImgElement.style.opacity = "1";
                quoteImgElement.style.transform = "scale(1)";
            };
        }

        if (quoteTextElement) {
            quoteTextElement.textContent = '“' + quoteObj.quote + '”';
        }

        if (quoteAuthorElement) {
            quoteAuthorElement.innerHTML = '<i class="fas fa-feather-alt"></i> ' + quoteObj.author;
        }
    }

    function shuffleQuote() {
        var currentImg = currentQuote ? currentQuote.img : "";
        var nextQuote = getRandomQuote(currentImg);
        renderQuote(nextQuote);
    }

    // Set initial quote on load
    shuffleQuote();

    // Shuffle Button Click
    if (shuffleBtn) {
        shuffleBtn.addEventListener("click", function (e) {
            e.preventDefault();
            shuffleQuote();
        });
    }

    // Copy Quote to Clipboard
    if (copyBtn) {
        copyBtn.addEventListener("click", function (e) {
            e.preventDefault();
            if (!currentQuote) return;

            var fullText = '“' + currentQuote.quote + '” — ' + currentQuote.author + ' (via Marwadi Chess: https://mchess.eg1.in)';

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(fullText).then(function () {
                    showCopySuccess();
                }).catch(function () {
                    fallbackCopy(fullText);
                });
            } else {
                fallbackCopy(fullText);
            }
        });
    }

    function showCopySuccess() {
        if (!copyBtn) return;
        var originalHtml = copyBtn.innerHTML;
        copyBtn.classList.add("copied");
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(function () {
            copyBtn.classList.remove("copied");
            copyBtn.innerHTML = originalHtml;
        }, 2200);
    }

    function fallbackCopy(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand("copy");
            showCopySuccess();
        } catch (err) {
            console.warn("Fallback copy failed:", err);
        }
        document.body.removeChild(textArea);
    }

    // Share Quote Button (Web Share API with fallback to Twitter/X)
    if (shareBtn) {
        shareBtn.addEventListener("click", function (e) {
            e.preventDefault();
            if (!currentQuote) return;

            var shareText = '“' + currentQuote.quote + '” — ' + currentQuote.author;
            var shareUrl = "https://mchess.eg1.in/blog.html?cat=Chess%20Quotes";

            if (navigator.share) {
                navigator.share({
                    title: "Chess Quote | Marwadi Chess",
                    text: shareText,
                    url: shareUrl
                }).catch(function () {
                    // User cancelled or share failed
                });
            } else {
                var twitterUrl = "https://twitter.com/intent/tweet?text=" + 
                    encodeURIComponent(shareText + " via @ChessMarwadi") + 
                    "&url=" + encodeURIComponent(shareUrl);
                window.open(twitterUrl, "_blank", "width=600,height=420");
            }
        });
    }
});
