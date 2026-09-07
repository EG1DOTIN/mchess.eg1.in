/**
 * Marwadi Chess - About Page Script (js/about.js)
 * Manages dynamic quote studio, text attribution, copy-to-clipboard,
 * web sharing, and interactive widgets.
 */

document.addEventListener("DOMContentLoaded", function () {
    // Curated quote dataset with accessible text, author, card image, and matching static landing page
    var curatedQuotes = [
        {
            img: "img/cpcq/id5.webp",
            page: "CQ - 1",
            quote: "Chess is the struggle against the error.",
            author: "Johannes Zukertort"
        },
        {
            img: "img/cpcq/id7.webp",
            page: "CQ - 3",
            quote: "Every chess master was once a beginner.",
            author: "Irving Chernev"
        },
        {
            img: "img/cpcq/id8.webp",
            page: "CQ - 4 ",
            quote: "The blunders are all there on the board, waiting to be made.",
            author: "Savielly Tartakower"
        },
        {
            img: "img/cpcq/id10.webp",
            page: "CQ - 6",
            quote: "Chess is not just a game; it is an art, a science, and a sport.",
            author: "Anatoly Karpov"
        },
        {
            img: "img/cpcq/id11.webp",
            page: "CQ - 7",
            quote: "A good player is always lucky.",
            author: "Jose Raul Capablanca"
        },
        {
            img: "img/cpcq/id12.webp",
            page: "CQ - 8",
            quote: "When you see a good move, look for a better one.",
            author: "Emanuel Lasker"
        },
        {
            img: "img/cpcq/id13.webp",
            page: "CQ - 9",
            quote: "Tactics is knowing what to do when there is something to do; strategy is knowing what to do when there is nothing to do.",
            author: "Savielly Tartakower"
        },
        {
            img: "img/cpcq/id14.webp",
            page: "CQ - 10",
            quote: "Chess holds its master in its own bonds, shackling the mind and brain.",
            author: "Albert Einstein"
        },
        {
            img: "img/cpcq/id15.webp",
            page: "CQ - 11",
            quote: "No price is too great for the scalp of a King.",
            author: "Bobby Fischer"
        },
        {
            img: "img/cpcq/id16.webp",
            page: "CQ - 12",
            quote: "Even a poor plan is better than no plan at all.",
            author: "Mikhail Chigorin"
        },
        {
            img: "img/cpcq/id17.webp",
            page: "CQ - 13",
            quote: "Play the opening like a book, the middle game like a magician, and the endgame like a machine.",
            author: "Rudolf Spielmann"
        },
        {
            img: "img/cpcq/id18.webp",
            page: "CQ - 14",
            quote: "Chess is life in miniature. Chess is a struggle, chess is battles.",
            author: "Garry Kasparov"
        },
        {
            img: "img/cpcq/id19.webp",
            page: "CQ - 15",
            quote: "One bad move nullifies forty good ones.",
            author: "Bernhard Horwitz"
        },
        {
            img: "img/cpcq/id20.webp",
            page: "CQ - 16",
            quote: "Pawns are the soul of chess.",
            author: "Francois-Andre Danican Philidor"
        },
        {
            img: "img/cpcq/id21.webp",
            page: "CQ - 17",
            quote: "In chess, knowledge is a weapon. You have to conquer that weapon.",
            author: "Viswanathan Anand"
        },
        {
            img: "img/cpcq/id22.webp",
            page: "CQ - 18",
            quote: "A sacrifice is best refuted by accepting it.",
            author: "Wilhelm Steinitz"
        },
        {
            img: "img/cpcq/id25.webp",
            page: "CQ - 21",
            quote: "There are two types of sacrifices: correct ones, and mine.",
            author: "Mikhail Tal"
        },
        {
            img: "img/cpcq/id30.webp",
            page: "CQ - 26",
            quote: "Chess doesn't drive people mad; it keeps mad people sane.",
            author: "Bill Hartston"
        },
        {
            img: "img/cpcq/id35.webp",
            page: "CQ - 31",
            quote: "The pawn is the most humble chess piece, but it can become the most powerful.",
            author: "Chess Wisdom"
        },
        {
            img: "img/cpcq/id41.webp",
            page: "CQ - 33",
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

    // Share Quote Button (Web Share API with image file attachment & dynamic social card)
    if (shareBtn) {
        shareBtn.addEventListener("click", async function (e) {
            e.preventDefault();
            if (!currentQuote) return;

            var shareTitle = 'Chess Quote by ' + currentQuote.author + ' | Marwadi Chess';
            var shareText = '“' + currentQuote.quote + '” — ' + currentQuote.author;
            var pageTitle = currentQuote.page || 'CQ - 1';
            var shareUrl = "https://mchess.eg1.in/blog/" + encodeURIComponent(pageTitle) + ".htm";

            // Try Web Share API Level 2 with image file attachment
            if (currentQuote.img && navigator.canShare && navigator.share && window.fetch) {
                try {
                    var response = await fetch(currentQuote.img);
                    if (response.ok) {
                        var blob = await response.blob();
                        var ext = currentQuote.img.split('.').pop() || 'webp';
                        var file = new File([blob], 'chess-quote.' + ext, { type: blob.type || 'image/webp' });
                        if (navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: shareTitle,
                                text: shareText + '\n' + shareUrl
                            });
                            return;
                        }
                    }
                } catch (shareErr) {
                    if (shareErr.name === 'AbortError') return;
                    console.log('Quote file share fallback:', shareErr);
                }
            }

            // Fallback 1: Web Share API with page URL (social platforms crawl og:image)
            if (navigator.share) {
                navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl
                }).catch(function (err) {
                    if (err.name !== 'AbortError') {
                        fallbackShareTwitter(shareText, shareUrl);
                    }
                });
            } else {
                // Fallback 2: Twitter / X Share Intent
                fallbackShareTwitter(shareText, shareUrl);
            }
        });
    }

    function fallbackShareTwitter(shareText, shareUrl) {
        var twitterUrl = "https://twitter.com/intent/tweet?text=" + 
            encodeURIComponent(shareText + " via @ChessMarwadi") + 
            "&url=" + encodeURIComponent(shareUrl);
        window.open(twitterUrl, "_blank", "width=600,height=420");
    }
});
