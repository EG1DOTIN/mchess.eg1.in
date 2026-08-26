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

    var allCachedBlogs = null;
    var currentLoadedBlog = null;
    var currentEngineBoardInstance = null;
    var nextPuzzleAutoTimer = null;

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

    $(document).on('click', '#pagination-controls a.detail-page-btn, #pagination-controls a.detail-nav-btn', function(e) {
        var targetId = $(this).data('id');
        if (targetId && allCachedBlogs) {
            var targetBlog = allCachedBlogs.find(function(b) { return String(b.id) === String(targetId); });
            if (targetBlog) {
                e.preventDefault();
                if (nextPuzzleAutoTimer) clearTimeout(nextPuzzleAutoTimer);
                transitionToBlogPuzzle(targetBlog, allCachedBlogs);
            }
        }
    });

    window.addEventListener('popstate', function(e) {
        var params = new URLSearchParams(window.location.search);
        var id = params.get('id');
        if (id && allCachedBlogs) {
            var targetBlog = allCachedBlogs.find(function(b) { return String(b.id) === String(id); });
            if (targetBlog) {
                if (nextPuzzleAutoTimer) clearTimeout(nextPuzzleAutoTimer);
                renderSingleBlog(targetBlog, allCachedBlogs);
            }
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
        allCachedBlogs = activeBlogs;
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
            allCachedBlogs = blogs;
            
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

            renderSingleBlog(blog, blogs);
        })
        .catch(function(error) {
            console.error('Error getting blog document:', error);
            hideLoading();
            setHeading('Error');
            renderMessage('Error loading the blog post. Please try again later.');
        });
    }

    function renderSingleBlog(blog, allBlogs) {
        currentLoadedBlog = blog;
        setHeading(blog.title || 'Blog');
        document.title = blog.title || document.title;
        $('meta[name="title"]').attr('content', blog.title || '');
        $('meta[name="description"]').attr('content', blog.metaDescription || '');

        var prevHeight = $('#blogs-container').outerHeight();
        if (prevHeight > 0) {
            $('#blogs-container').css('min-height', prevHeight + 'px');
        }

        $('#blogs-container').html(renderBlogView(blog, allBlogs));

        var isPuzzleBlog = blog.category && (blog.category.indexOf('Mate') !== -1 || blog.category.indexOf('Puzzle') !== -1 || (blog.title && blog.title.toLowerCase().indexOf('mate in') !== -1));

        if (typeof MChessEngineBoard !== 'undefined') {
            $('#mchessBlogEngineBoard').each(function() {
                currentEngineBoardInstance = new MChessEngineBoard(this, {
                    mode: isPuzzleBlog ? 'puzzle' : 'engine',
                    category: blog.category,
                    title: blog.title,
                    description: blog.full_description,
                    skillLevel: 20, // Grandmaster level for puzzle defense
                    blogId: blog.id,
                    onPuzzleSolved: function(streak, boardInst) {
                        handleBlogPuzzleSolved(currentLoadedBlog || blog, allCachedBlogs || allBlogs, boardInst);
                    }
                });
            });
        }

        setTimeout(function() {
            $('#blogs-container').css('min-height', '');
        }, 350);
    }

    function handleBlogPuzzleSolved(currentBlog, allBlogs, boardInstance) {
        if (!allBlogs || !currentBlog || !boardInstance) return;

        var categoryBlogs = allBlogs.filter(function(b) {
            return b.category === currentBlog.category;
        });
        if (categoryBlogs.length === 0) categoryBlogs = allBlogs.slice();

        var currentIndex = categoryBlogs.findIndex(function(b) {
            return String(b.id) === String(currentBlog.id);
        });

        if (currentIndex !== -1 && currentIndex < categoryBlogs.length - 1) {
            var nextBlog = categoryBlogs[currentIndex + 1];
            
            boardInstance.updateStatusBanner(
                '<i class="fas fa-trophy" style="color:#d4af37;"></i> 🎉 <strong>Puzzle Solved!</strong> Loading next puzzle...'
            );

            if (nextPuzzleAutoTimer) clearTimeout(nextPuzzleAutoTimer);
            nextPuzzleAutoTimer = setTimeout(function() {
                transitionToBlogPuzzle(nextBlog, allBlogs);
            }, 1500);
        } else {
            boardInstance.updateStatusBanner(
                '<i class="fas fa-trophy" style="color:#d4af37;"></i> 🏆 <strong>All puzzles in ' + escapeHtml(currentBlog.category || 'this category') + ' solved! Great Job!</strong>'
            );
        }
    }

    function transitionToBlogPuzzle(nextBlog, allBlogs) {
        if (!nextBlog) return;

        // 1. Update Browser URL & History without page reload
        var newUrl = 'blog.html?id=' + encodeURIComponent(nextBlog.id);
        window.history.pushState({ id: nextBlog.id }, '', newUrl);

        // 2. Render Full Blog (full description, title, category, fresh board, and in-category pagination)
        renderSingleBlog(nextBlog, allBlogs);
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
    function renderBlogView(blog, allBlogs) {
        var image_label = getBlogImageUrl(blog.output_image);
        var processedDescription = blog.full_description || '';
        
        var hasBoard = false;
        if (typeof MChessFenParser !== 'undefined') {
            var parsed = MChessFenParser.parseDescription(processedDescription);
            if (parsed && parsed.fen) {
                hasBoard = true;
            }
            processedDescription = MChessFenParser.replaceChessbaseIframe(processedDescription);
        }

        // If the blog contains an interactive chessboard, omit the static thumbnail image to keep board prominently in view
        var imageHtml = '';
        if (!hasBoard && image_label) {
            imageHtml = '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">' +
                            '<img src="' + escapeAttr(image_label) + '" loading="lazy" style="width: 100%; max-width: 640px; display: block; margin: 0 auto;" />' +
                        '</div>';
        }

        var paginationHtml = renderDetailPagination(blog, allBlogs);

        return '' +
            '<div class="row blog-item-container">' +
                '<div class="col-md-12 margin-bottom">' +
                    '<div class="our-product">' +
                        '<div class="row">' +
                            imageHtml +
                            '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 left">' +
                                '<p class="mt-3"><i class="icon icon-list-alt"></i>&nbsp;' + escapeHtml(blog.category || '') + ' | <i class="icon icon-user"></i>&nbsp;Admin</p>' +
                            '</div>' +
                        '</div>' +
                        '<div class="row mrgin-top20">' +
                            '<div class="col-md-12 left" style="font-size: 16px; line-height: 1.6;">' +
                                processedDescription +
                            '</div>' +
                        '</div>' +
                        paginationHtml +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    function renderDetailPagination(blog, allBlogs) {
        if (!allBlogs || allBlogs.length <= 1) return '';

        var categoryBlogs = [];
        if (blog.category) {
            categoryBlogs = allBlogs.filter(function(b) {
                return b.category === blog.category;
            });
        }
        if (categoryBlogs.length <= 1) {
            categoryBlogs = allBlogs.slice();
        }
        if (categoryBlogs.length <= 1) return '';

        var currentIndex = categoryBlogs.findIndex(function(b) {
            return String(b.id) === String(blog.id);
        });
        if (currentIndex === -1) {
            currentIndex = 0;
        }

        var totalItems = categoryBlogs.length;
        var currentNum = currentIndex + 1;

        var prevBtn = currentIndex > 0
            ? '<a href="blog.html?id=' + encodeURIComponent(categoryBlogs[currentIndex - 1].id) + '" data-id="' + escapeAttr(categoryBlogs[currentIndex - 1].id) + '" class="btn btn-default bg-pager detail-nav-btn" title="Previous">&laquo; Previous</a>'
            : '<button class="btn btn-default bg-pager disabled" disabled>&laquo; Previous</button>';

        var nextBtn = currentIndex < totalItems - 1
            ? '<a href="blog.html?id=' + encodeURIComponent(categoryBlogs[currentIndex + 1].id) + '" data-id="' + escapeAttr(categoryBlogs[currentIndex + 1].id) + '" class="btn btn-default bg-pager detail-nav-btn" title="Next">Next &raquo;</a>'
            : '<button class="btn btn-default bg-pager disabled" disabled>Next &raquo;</button>';

        var startPage = Math.max(1, currentNum - 2);
        var endPage = Math.min(totalItems, currentNum + 2);

        if (currentNum <= 3) {
            endPage = Math.min(totalItems, 5);
        }
        if (currentNum >= totalItems - 2) {
            startPage = Math.max(1, totalItems - 4);
        }

        var pageButtons = '';
        for (var p = startPage; p <= endPage; p++) {
            if (p === currentNum) {
                pageButtons += '<button class="btn btn-primary disabled" disabled>' + p + '</button>';
            } else {
                var targetBlog = categoryBlogs[p - 1];
                pageButtons += '<a href="blog.html?id=' + encodeURIComponent(targetBlog.id) + '" data-id="' + escapeAttr(targetBlog.id) + '" class="btn btn-default bg-pager detail-page-btn" title="' + escapeAttr(targetBlog.title || '') + '">' + p + '</a>';
            }
        }

        return '' +
            '<div id="pagination-controls" class="row blog-item-container" style="margin-top: 25px; margin-bottom: 15px;">' +
                '<div class="col-md-12">' +
                    '<div class="text-center">' +
                        '<div class="btn-group">' +
                            prevBtn +
                            pageButtons +
                            nextBtn +
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
