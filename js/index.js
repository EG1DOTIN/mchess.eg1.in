$(document).on('ready', function () {
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
});

function CopyToClipboard(containerid) {
    if (document.selection) {
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select().createTextRange();
        document.execCommand("copy");
        $("#clipmsg").html("<span style='margin-left:20px;background-color:#000;color:#fff;padding:3px 10px;margin-top:3px;font-size:12px;border-radius:3px;'>Copied</span>");
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().addRange(range);
        document.execCommand("copy");
        $("#clipmsg").html("<span style='margin-left:20px;background-color:#000;color:#fff;padding:3px 10px;margin-top:3px;font-size:12px;border-radius:3px;'>Copied</span>");
    }
}
