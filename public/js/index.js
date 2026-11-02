$(document).ready(function () {
    if ($.fn.slick && $(".regular").length) {
        $(".regular").slick({
            dots: false,
            infinite: false,
            slidesToShow: 3,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        infinite: false,
                        dots: false
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        });
    }
});

function CopyToClipboard(containerid) {
    var el = document.getElementById(containerid);
    if (!el) return;
    var copyText = el.innerText || el.textContent;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText).then(function() {
            $("#clipmsg").html("<span style='margin-left:20px;background-color:#000;color:#fff;padding:3px 10px;margin-top:3px;font-size:12px;border-radius:3px;'>Copied</span>");
        }).catch(function() {
            fallbackCopy(el);
        });
    } else {
        fallbackCopy(el);
    }

    function fallbackCopy(element) {
        if (document.selection) {
            var range = document.body.createTextRange();
            range.moveToElementText(element);
            range.select().createTextRange();
            document.execCommand("copy");
            $("#clipmsg").html("<span style='margin-left:20px;background-color:#000;color:#fff;padding:3px 10px;margin-top:3px;font-size:12px;border-radius:3px;'>Copied</span>");
        } else if (window.getSelection) {
            var range = document.createRange();
            range.selectNode(element);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand("copy");
            $("#clipmsg").html("<span style='margin-left:20px;background-color:#000;color:#fff;padding:3px 10px;margin-top:3px;font-size:12px;border-radius:3px;'>Copied</span>");
        }
    }
}
