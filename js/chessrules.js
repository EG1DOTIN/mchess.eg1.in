function getBlogImageUrl(imageUrl) {
    if (!imageUrl) return 'img/mchesshome.webp';
    try {
        var parsed = new URL(imageUrl, window.location.href);
        var pathname = parsed.pathname;
        var match = pathname.match(/\/(mi2|mi3|mi4)\/(.+)$/i);
        if (match) {
            var folder = match[1].toLowerCase();
            var filename = match[2];
            filename = filename.replace(/\.(png|jpg|jpeg)$/i, '.webp');
            return folder + '/' + filename;
        }
        return imageUrl;
    } catch (e) {
        console.error('Error processing blog image URL:', e);
        return imageUrl || 'img/mchesshome.webp';
    }
}

$(document).ready(async function () {
    try {
        var blogs = await DataCache.getBlogs();
        $('#loading-indicator').hide();

        var blog = blogs.find(function(b) {
            return (b.id == "2" || b.id == 2) && b.category === "Learn Chess";
        }) || blogs.find(function(b) {
            return (b.id == "2" || b.id == 2);
        });

        var image_label = null;
        if (blog) {
            image_label = getBlogImageUrl(blog.output_image);
        }

        if (!blog) {
            $('#rules-content').html('<div class="alert alert-danger">Content not found.</div>');
            return;
        }
        var html = `
            <div class="our-product">
                <div class="row">
                    <div class="col-lg-10 col-md-10 col-sm-12 col-xs-12" style="width: 100%; max-width: 550px; margin: 0 auto;">
                        <img src="${image_label}" style="width: 100%; display: block;" />
                    </div>
                    <div class="col-lg-8 col-md-8 col-sm-12 col-xs-12 left">
                        <h2 class="text-black">${blog.title}</h2>
                        <p>
                            <i class="icon icon-list-alt"></i>&nbsp;${blog.category}
                            | <i class="icon icon-user"></i>&nbsp;Admin
                        </p>
                    </div>
                </div>
                <div class="row mrgin-top20">
                    <div class="col-md-12 left">
                        ${blog.full_description}
                    </div>
                </div>
            </div>
        `;
        $('#rules-content').html(html);
    }).catch(function (error) {
        console.error("Error getting document:", error);
        $('#loading-indicator').hide();
        $('#rules-content').html('<div class="alert alert-danger">Error loading content.</div>');
    });
});
