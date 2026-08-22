$(document).ready(function() {
    var params = new URLSearchParams(window.location.search);
    var docId = params.get('id');
    var titleParam = params.get('title') || params.get('id?title');
    var category = params.get('cat');
    var PAGE_SIZE = 18;
    var blogsPage = 1;
    var blogsHasMore = false;
    var totalBlogPages = 1;
    var currentSearchTerm = '';

    loadCategories();
    loadRelatedTopics();

    if (docId || titleParam) {
        $('#txtSearch, #btnSearch').prop('disabled', true);
        loadBlogView(docId, titleParam);
    } else {
        setHeading(category || 'Blogs');
        loadBlogList();
    }

    $('#btnSearch').click(function() {
        currentSearchTerm = $('#txtSearch').val().trim().toLowerCase();
        blogsPage = 1;
        loadBlogList();
    });

    $('#txtSearch').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            $('#btnSearch').click();
        }
    });

    $(document).on('click', '#prevPage', function() {
        if (blogsPage > 1) {
            blogsPage--;
            loadBlogList();
        }
    });

    $(document).on('click', '#nextPage', function() {
        if (blogsHasMore) {
            blogsPage++;
            loadBlogList();
        }
    });

    $(document).on('click', '.blog-grid-card', function(e) {
        // If the click landed on (or inside) a real <a>, let the browser
        // handle that navigation natively. Without this guard, clicks on
        // the title/image links bubble up to this handler too, and the
        // programmatic redirect below races against the anchor's own
        // navigation to the same URL — which is what made the link
        // unreliable.
        if ($(e.target).closest('a').length) {
            return;
        }

        var url = $(this).data('url');
        if (url) {
            window.location.href = url;
        }
    });

    $(document).on('keypress', '.blog-grid-card', function(e) {
        if (e.which === 13) {
            $(this).click();
        }
    });

    $(document).on('click', '.pageNumber', function() {
        var selectedPage = Number($(this).data('page'));
        if (selectedPage && selectedPage !== blogsPage) {
            blogsPage = selectedPage;
            loadBlogList();
        }
    });

    function setHeading(text) {
        $('#blog-page-heading').text(text);
    }

    function showLoading() {
        $('#loading-indicator').show();
        $('.blog-item-container').remove();
        $('#pagination-controls').remove();
    }

    function hideLoading() {
        $('#loading-indicator').hide();
    }

    async function fetchAllBlogsFlat(categoryFilter = null) {
        var activeBlogs = await DataCache.getBlogs();
        if (categoryFilter) {
            return activeBlogs.filter(function(b) { return b.category === categoryFilter; });
        }
        return activeBlogs;
    }

    function loadBlogList() {
        showLoading();

        fetchAllBlogsFlat(category)
            .then(function(docs) {
                hideLoading();

                if (docs.length === 0) {
                    renderMessage('No Record Found');
                    return;
                }

                if (currentSearchTerm !== '') {
                    docs = docs.filter(function(blog) {
                        return containsSearch(blog.title) ||
                            containsSearch(blog.category) ||
                            containsSearch(blog.metaDescription) ||
                            containsSearch(blog.full_description);
                    });
                }

                var pageSize = category || currentSearchTerm !== '' ? PAGE_SIZE : 1;
                var startIdx = (blogsPage - 1) * pageSize;
                var displayDocs = docs.slice(startIdx, startIdx + pageSize);
                totalBlogPages = Math.max(1, Math.ceil(docs.length / pageSize));
                blogsHasMore = blogsPage < totalBlogPages;

                if (displayDocs.length === 0) {
                    renderMessage('No Record Found');
                    renderPagination();
                    return;
                }

                displayDocs.forEach(function(blog) {
                    $('#blogs-container').append(category ? renderGridBlog(blog) : renderListBlog(blog));
                });

                if (typeof MChessEngineBoard !== 'undefined') {
                    $('#blogs-container #mchessBlogEngineBoard').each(function() {
                        new MChessEngineBoard(this);
                    });
                }

                renderPagination();
            })
            .catch(function(error) {
                console.error('Error getting blog documents:', error);
                hideLoading();
                renderMessage('Error loading blogs. Please try again later.');
            });
    }

    function findBlogByTitle(blogs, titleQuery) {
        if (!titleQuery) return null;
        var target = titleQuery.trim().toLowerCase();
        var targetSlug = target.replace(/[-_\s]+/g, ' ');

        var match = blogs.find(function(b) {
            return b.title && b.title.trim().toLowerCase() === target;
        });
        if (match) return match;

        return blogs.find(function(b) {
            if (!b.title) return false;
            var bSlug = b.title.trim().toLowerCase().replace(/[-_\s]+/g, ' ');
            return bSlug === targetSlug;
        }) || null;
    }

    function loadBlogView(id, titleQuery) {
        showLoading();

        fetchAllBlogsFlat().then(function(blogs) {
            hideLoading();
            
            var blog = null;
            if (id) {
                blog = blogs.find(function(b) { return String(b.id) === String(id); });
            }
            if (!blog && titleQuery) {
                blog = findBlogByTitle(blogs, titleQuery);
            }

            if (!blog) {
                setHeading('Blog Not Found');
                renderMessage('The requested blog post does not exist.');
                return;
            }

            setHeading(blog.title || 'Blog');
            document.title = blog.title || document.title;
            $('meta[name="title"]').attr('content', blog.title || '');
            $('meta[name="description"]').attr('content', blog.metaDescription || '');

            $('#blogs-container').append(renderBlogView(blog));

            if (typeof MChessEngineBoard !== 'undefined') {
                $('#mchessBlogEngineBoard').each(function() {
                    if (!$(this).data('mchess-initialized')) {
                        $(this).data('mchess-initialized', true);
                        new MChessEngineBoard(this);
                    }
                });
            }
        })
        .catch(function(error) {
            console.error('Error getting blog document:', error);
            hideLoading();
            setHeading('Error');
            renderMessage('Error loading the blog post. Please try again later.');
        });
    }

    async function loadCategories() {
        try {
            var categories = await DataCache.getCategories();
            renderCategoriesList(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    function renderCategoriesList(categories) {
        categories.forEach(function(cat) {
            var encodedCat = encodeURIComponent(cat);
            var li = '<li class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><a href="blog.html?cat=' + encodedCat + '" title="' + escapeAttr(cat) + '">' + escapeHtml(cat) + '</a></li>';
            $('#category-list').append(li);
        });
    }

    function loadRelatedTopics() {
        // Fetch ALL blogs to find related ones properly
        fetchAllBlogsFlat().then(function(allBlogs) {
            if (allBlogs.length === 0) {
                $('#related-topics-list').append('<div class="btn-group callout callout-danger icon-1x">No Record Found</div>');
                return;
            }

            var relatedBlogs = [];

            if (docId || titleParam) {
                // A specific blog is selected
                var selectedBlog = null;
                if (docId) {
                    selectedBlog = allBlogs.find(function(b) { return String(b.id) === String(docId); });
                }
                if (!selectedBlog && titleParam) {
                    selectedBlog = findBlogByTitle(allBlogs, titleParam);
                }

                if (selectedBlog) {
                    var selectedId = selectedBlog.id;
                    // Get all blogs in same category, sorted by release_date_ms desc
                    var sameCategoryBlogs = allBlogs.filter(function(b) { return b.category === selectedBlog.category; });
                    sameCategoryBlogs.sort(function(a, b) { return (b.release_date_ms || 0) - (a.release_date_ms || 0); });

                    var selIdxInCat = sameCategoryBlogs.findIndex(function(b) { return String(b.id) === String(selectedId); });
                    
                    if (sameCategoryBlogs.length > 1) {
                        var newer = sameCategoryBlogs.slice(0, selIdxInCat); // index 0 to selIdxInCat - 1
                        var older = sameCategoryBlogs.slice(selIdxInCat + 1); // selIdxInCat + 1 to end
                        
                        newer.reverse(); // Now newer[0] is closest to selected
                        
                        var takeNewer = Math.min(5, newer.length);
                        var takeOlder = Math.min(5, older.length);
                        
                        // Compensate if one side has fewer than 5
                        if (takeNewer < 5) takeOlder = Math.min(10 - takeNewer, older.length);
                        if (takeOlder < 5) takeNewer = Math.min(10 - takeOlder, newer.length);
                        
                        var finalNewer = newer.slice(0, takeNewer).reverse(); // Put back in desc order
                        var finalOlder = older.slice(0, takeOlder);
                        
                        relatedBlogs = finalNewer.concat(finalOlder);
                    } else {
                        // Fallback: 1 latest blog across all categories
                        var latestBlogs = allBlogs.filter(function(b) { return String(b.id) !== String(selectedId); });
                        latestBlogs.sort(function(a, b) { return (b.release_date_ms || 0) - (a.release_date_ms || 0); });
                        relatedBlogs = latestBlogs.slice(0, 1);
                    }
                }
            } else if (category) {
                // Category is selected
                var sameCategoryBlogs = allBlogs.filter(function(b) { return b.category === category; });
                sameCategoryBlogs.sort(function(a, b) { return (b.release_date_ms || 0) - (a.release_date_ms || 0); });
                relatedBlogs = sameCategoryBlogs.slice(0, 10);
            } else {
                // Latest blogs page
                var latestBlogs = allBlogs.slice();
                latestBlogs.sort(function(a, b) { return (b.release_date_ms || 0) - (a.release_date_ms || 0); });
                relatedBlogs = latestBlogs.slice(0, 10);
            }

            if (relatedBlogs.length === 0) {
                $('#related-topics-list').append('<div class="btn-group callout callout-danger icon-1x">No Record Found</div>');
                return;
            }

            relatedBlogs.forEach(function(blog) {
                var html = '' +
                    '<a href="blog.html?id=' + encodeURIComponent(blog.id) + '" style="display:block;text-decoration:none;color:#333;">' +
                        '<div class="row lnkbtnsidebar" style="margin: 0; border-bottom: 1px solid #ddd; padding: 10px 0;">' +
                            '<ul>' +
                                '<li style="list-style:none;margin-left:0;">' +
                                    '<h6><b class="release-date"><i class="icon icon-list-alt"></i>&nbsp;' + escapeHtml(blog.category || '') + '</b>&nbsp;&nbsp;<b class="icon-1x">' + escapeHtml(blog.title || '') + '</b></h6>' +
                                    '</li>' +
                                '</ul>' +
                            '</div>' +
                        '</a>';
                    $('#related-topics-list').append(html);
                });
            })
            .catch(function(error) {
                console.error('Error loading related topics:', error);
            });
    }

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

    function renderListBlog(blog) {
        var image_path = getBlogImageUrl(blog.output_image);
        return '' +
            '<div class="row blog-item-container">' +
                '<div class="col-md-12 margin-bottom">' +
                    '<div class="our-product">' +
                        '<div class="row">' +
                            '<div class="col-md-12">' +
                                '<div class="row">' +
                                    '<div class="col-lg-10 col-md-10 col-sm-12 col-xs-12">' +
                                        '<a href="blog.html?id=' + encodeURIComponent(blog.id) + '">' +
                                            '<img src="' + escapeAttr(image_path) + '" loading="lazy" style="width: 100%;" />' +
                                        '</a>' +
                                    '</div>' +
                                    '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 left">' +
                                        '<a href="blog.html?id=' + encodeURIComponent(blog.id) + '">' +
                                            '<h3 class="text-black">' + escapeHtml(blog.title || '') + '</h3>' +
                                        '</a>' +
                                        '<p><i class="icon icon-list-alt"></i>&nbsp;' + escapeHtml(blog.category || '') + ' | <i class="icon icon-user"></i>&nbsp;Admin</p>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="row mrgin-top20">' +
                                    '<div class="col-md-12 left">' +
                                        (typeof MChessFenParser !== 'undefined' ? MChessFenParser.replaceChessbaseIframe(blog.full_description || '') : (blog.full_description || '')) +
                                        '<br/>' +
                                        '<a href="blog.html?id=' + encodeURIComponent(blog.id) + '" class="btn btn-primary btn-sm mt-2">Read More</a>' +
                                    '</div>' +
                                '</div>' +
                                '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    function renderGridBlog(blog) {
        var image_path = getBlogImageUrl(blog.output_image);

        var blogUrl = 'blog.html?id=' + encodeURIComponent(blog.id);
        return '' +
            '<div class="col-md-4 margin-bottom blog-item-container">' +
                '<div class="our-product blogs blog-grid-card" data-url="' + escapeAttr(blogUrl) + '" role="link" tabindex="0" style="cursor:pointer;">' +
                    '<div class="row">' +
                        '<div class="col-md-12 left">' +
                            '<div class="blogimg">' +
                            '<a href="' + escapeAttr(blogUrl) + '">' +
                                '<img src="' + escapeAttr(image_path) + '" loading="lazy" width="100%" />' +
                            '</a>' +
                            '</div>' +
                            '<div class="blogbody">' +
                            '<a href="' + escapeAttr(blogUrl) + '">' +
                                '<h3 class="text-black">' + escapeHtml(blog.title || '') + '</h3>' +
                                '<p><small><i class="icon icon-list-alt"></i>&nbsp;' + escapeHtml(blog.category || '') + ' | <i class="icon icon-user"></i>&nbsp;Admin</small></p>' +
                                '<div class="shortcontent">' + escapeHtml(blog.metaDescription || '') + '</div>' +
                                // '<span class="btn btn-primary btn-sm blog-read-btn">Read More</span>' +
                            '</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }
    function renderBlogView(blog) {
        var image_label = getBlogImageUrl(blog.output_image);
        var processedDescription = blog.full_description || '';
        
        if (typeof MChessFenParser !== 'undefined') {
            processedDescription = MChessFenParser.replaceChessbaseIframe(processedDescription);
        }
        
        setTimeout(function() {
            if ($('#mchessBlogEngineBoard').length && typeof MChessEngineBoard !== 'undefined') {
                new MChessEngineBoard('#mchessBlogEngineBoard');
            }
        }, 100);

        return '' +
            '<div class="row blog-item-container">' +
                '<div class="col-md-12 margin-bottom">' +
                    '<div class="our-product">' +
                        '<div class="row">' +
                            '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">' +
                                '<img src="' + escapeAttr(image_label) + '" loading="lazy" style="width: 100%; max-width: 640px; display: block; margin: 0 auto;" />' +
                            '</div>' +
                            '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 left">' +
                                '<p class="mt-3"><i class="icon icon-list-alt"></i>&nbsp;' + escapeHtml(blog.category || '') + ' | <i class="icon icon-user"></i>&nbsp;Admin</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="row mrgin-top20">' +
                            '<div class="col-md-12 left" style="font-size: 16px; line-height: 1.6;">' +
                                processedDescription +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    function renderPagination() {
        $('#pagination-controls').remove();
        if (blogsPage === 1 && !blogsHasMore) return;

        var prevDisabled = blogsPage === 1 ? 'disabled' : '';
        var nextDisabled = !blogsHasMore ? 'disabled' : '';
        var pageButtons = renderPageButtons();
        var paginationHtml = '' +
            '<div id="pagination-controls" class="row blog-item-container" style="margin-top: 20px; margin-bottom: 24px;">' +
                '<div class="col-md-12">' +
                    '<div class="text-center">' +
                        '<div class="btn-group">' +
                            '<button id="prevPage" class="btn btn-default bg-pager" ' + prevDisabled + '>&laquo; Previous</button>' +
                            pageButtons +
                            '<button id="nextPage" class="btn btn-default bg-pager" ' + nextDisabled + '>Next &raquo;</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        $('#blogs-container').append(paginationHtml);
    }

    function renderPageButtons() {
        var html = '';
        var startPage = Math.max(1, blogsPage - 2);
        var endPage = Math.min(totalBlogPages, blogsPage + 2);

        if (blogsPage <= 3) {
            endPage = Math.min(totalBlogPages, 5);
        }

        if (blogsPage >= totalBlogPages - 2) {
            startPage = Math.max(1, totalBlogPages - 4);
        }

        for (var page = startPage; page <= endPage; page++) {
            var activeClass = page === blogsPage ? 'btn-primary disabled' : 'btn-default bg-pager pageNumber';
            var dataPage = page === blogsPage ? '' : ' data-page="' + page + '"';
            html += '<button class="btn ' + activeClass + '"' + dataPage + '>' + page + '</button>';
        }

        return html;
    }

    function renderMessage(message) {
        $('#blogs-container').append('<div class="btn-group callout callout-danger icon-1x blog-item-container">' + escapeHtml(message) + '</div>');
    }

    function containsSearch(value) {
        return value && String(value).toLowerCase().indexOf(currentSearchTerm) !== -1;
    }

    function compareBlogDocsDesc(a, b) {
        var aValue = sortValue(a.data().id, a.id);
        var bValue = sortValue(b.data().id, b.id);
        if (aValue < bValue) return 1;
        if (aValue > bValue) return -1;
        return 0;
    }

    function sortValue(fieldId, docId) {
        var value = fieldId === undefined || fieldId === null ? docId : fieldId;
        var numeric = Number(value);
        return isNaN(numeric) ? String(value) : numeric;
    }

    function escapeHtml(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }
});
