if (typeof getBlogImageUrl !== 'function') {
    function getBlogImageUrl(imageUrl) {
        if (!imageUrl) return 'img/mchesshome.webp';
        try {
            var parsed = new URL(imageUrl, window.location.href);
            var pathname = parsed.pathname;
            var match = pathname.match(/\/(?:img\/)?(mi2|mi3|mi4|cpcq)\/(.+)$/i);
            if (match) {
                var folder = match[1].toLowerCase();
                var filename = match[2];
                filename = filename.replace(/\.(png|jpg|jpeg)$/i, '.webp');
                return 'img/' + folder + '/' + filename;
            }
            return imageUrl;
        } catch (e) {
            console.error('Error processing blog image URL:', e);
            return imageUrl || 'img/mchesshome.webp';
        }
    }
}

function escapeHtmlRules(value) {
    return String(value === undefined || value === null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

$(document).ready(function () {
    (async function() {
        try {
            var blogs = await DataCache.getBlogs();
            $('#loading-indicator').hide();

            var blog = blogs.find(function(b) {
                return (b.id == "2" || b.id == 2) && b.category === "Learn Chess";
            }) || blogs.find(function(b) {
                return (b.id == "2" || b.id == 2);
            });

            if (!blog) {
                $('#rules-content').html('<div class="alert alert-danger">Content not found.</div>');
                return;
            }

            var image_label = getBlogImageUrl(blog.output_image);
            var escapedTitle = escapeHtmlRules(blog.title || '');
            var escapedCategory = escapeHtmlRules(blog.category || '');
            var fullDesc = blog.full_description || '';

            var html = '' +
                '<div class="our-product">' +
                    '<div class="row">' +
                        '<div class="col-lg-10 col-md-10 col-sm-12 col-xs-12" style="width: 100%; max-width: 550px; margin: 0 auto;">' +
                            '<img src="' + escapeHtmlRules(image_label) + '" loading="lazy" style="width: 100%; display: block;" />' +
                        '</div>' +
                        '<div class="col-lg-8 col-md-8 col-sm-12 col-xs-12 left">' +
                            '<h2 class="text-black">' + escapedTitle + '</h2>' +
                            '<p>' +
                                '<i class="icon icon-list-alt"></i>&nbsp;' + escapedCategory + ' | <i class="icon icon-user"></i>&nbsp;Admin' +
                            '</p>' +
                        '</div>' +
                    '</div>' +
                    '<div class="row mrgin-top20">' +
                        '<div class="col-md-12 left">' +
                            fullDesc +
                        '</div>' +
                    '</div>' +
                '</div>';
            $('#rules-content').html(html);
        } catch (error) {
            console.error("Error getting document:", error);
            $('#loading-indicator').hide();
            $('#rules-content').html('<div class="alert alert-danger">Error loading content.</div>');
        }
    })();
});
