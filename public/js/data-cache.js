/**
 * DataCache for MCHESS
 * Provides persistent localStorage caching for mchess_blog and master dataset (data/mchess-data.json).
 * Supports instant cache invalidation via 1-click header App Refresh (_r URL parameter) and safe TTL expiry.
 */
var DataCache = {
    blogs: null,
    categories: null,
    lastError: null,
    CACHE_TTL: 3600000, // 1 hour TTL
    lastFetchSource: {},

    /**
     * Checks whether the current URL contains a refresh query parameter (_r)
     */
    _hasUrlRefreshParam: function () {
        try {
            return typeof window !== 'undefined' && 
                   window.location && 
                   new URLSearchParams(window.location.search).has('_r');
        } catch (e) {
            return false;
        }
    },

    _getPersistentCache: function(key) {
        try {
            var data = localStorage.getItem(key);
            var time = localStorage.getItem(key + '_time');
            if (data && time && (Date.now() - parseInt(time, 10) < this.CACHE_TTL)) {
                var parsed = JSON.parse(data);
                // Ensure cached array is valid and non-empty
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn("LocalStorage read error for " + key + ":", e);
        }
        return null;
    },

    _setPersistentCache: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            localStorage.setItem(key + '_time', Date.now().toString());
        } catch (e) {
            console.warn("LocalStorage write error for " + key + ":", e);
        }
    },

    clearCache: function(type) {
        try {
            if (!type || type === 'blogs') {
                this.blogs = null;
                localStorage.removeItem('mchess_blogs_cache');
                localStorage.removeItem('mchess_blogs_cache_time');
            }
            if (!type || type === 'categories') {
                this.categories = null;
                localStorage.removeItem('mchess_categories_cache');
                localStorage.removeItem('mchess_categories_cache_time');
            }
            console.log("[DataCache-MCHESS] Cleared cache for type:", type || 'ALL');
        } catch (e) {
            console.error("[DataCache-MCHESS] Error clearing cache:", e);
        }
    },

    getBlogs: async function (forceRefresh) {
        var isForced = Boolean(forceRefresh || this._hasUrlRefreshParam());

        if (isForced) {
            this.clearCache('blogs');
        }

        if (this.blogs && Array.isArray(this.blogs) && this.blogs.length > 0 && !isForced) {
            this.lastFetchSource.blogs = 'memory (0 reads)';
            return (this.blogs || []).filter(function(b) {
                return b.active === "1" || b.active === 1 || b.active === true || !b.hasOwnProperty('active');
            });
        }

        if (!isForced) {
            var cached = this._getPersistentCache('mchess_blogs_cache');
            if (cached && Array.isArray(cached) && cached.length > 0) {
                this.blogs = cached;
                this.lastFetchSource.blogs = 'localStorage (0 reads)';
                console.log("[DataCache-MCHESS] Using cached blogs from localStorage (" + cached.length + " items, 0 Firestore reads)");
                return (this.blogs || []).filter(function(b) {
                    return b.active === "1" || b.active === 1 || b.active === true || !b.hasOwnProperty('active');
                });
            }
        }

        try {
            console.log("[DataCache-MCHESS] Fetching fresh dataset (data/mchess-data.json, forced=" + isForced + ")...");

            var fetchUrl = 'data/mchess-data.json' + (isForced ? '?_v=' + Date.now() : '');
            var resp = await fetch(fetchUrl, {
                cache: isForced ? 'reload' : 'no-cache'
            });
            if (!resp.ok) {
                throw new Error("HTTP error " + resp.status + " fetching data/mchess-data.json");
            }

            var dataset = await resp.json();
            var rawBlogs = dataset.blogs || dataset;

            if (!Array.isArray(rawBlogs)) {
                throw new Error("Invalid dataset format: expected array of blogs");
            }

            this.blogs = rawBlogs.map(function(item) {
                var blogData = Object.assign({}, item);
                if (blogData.release_date && !blogData.release_date_ms) {
                    var parsedDateMs = new Date(blogData.release_date).getTime();
                    if (!isNaN(parsedDateMs)) {
                        blogData.release_date_ms = parsedDateMs;
                    }
                }
                return blogData;
            });

            this.blogs.sort(function(a, b) {
                var valA = parseInt(a.id, 10);
                var valB = parseInt(b.id, 10);
                if (isNaN(valA)) valA = a.id;
                if (isNaN(valB)) valB = b.id;
                if (valA < valB) return 1;
                if (valA > valB) return -1;
                return 0;
            });

            if (this.blogs.length > 0) {
                this._setPersistentCache('mchess_blogs_cache', this.blogs);
            }
            this.lastFetchSource.blogs = 'local dataset (data/mchess-data.json, 0 Firestore reads)';
            this.lastError = null;
        } catch (e) {
            console.warn("[DataCache-MCHESS] Local dataset fetch failed, attempting Firestore fallback:", e.message);
            // Fallback to Firestore if local dataset is unavailable
            try {
                if (typeof db !== 'undefined' && db) {
                    var snap = await db.collection('mchess_blog').get();
                    this.blogs = [];
                    snap.docs.forEach(function(doc) {
                        var catData = doc.data();
                        var catName = doc.id;
                        for (var [key, value] of Object.entries(catData)) {
                            if (key.startsWith('page') && value && typeof value === 'object') {
                                for (var [blogId, blogData] of Object.entries(value)) {
                                    if (blogData && typeof blogData === 'object') {
                                        if (blogData.release_date && typeof blogData.release_date.toDate === 'function') {
                                            blogData.release_date_ms = blogData.release_date.toDate().getTime();
                                        } else if (blogData.release_date) {
                                            var parsedMs = new Date(blogData.release_date).getTime();
                                            if (!isNaN(parsedMs)) blogData.release_date_ms = parsedMs;
                                        }
                                        this.blogs.push({ id: blogId, category: catName, ...blogData });
                                    }
                                }
                            }
                        }
                    }.bind(this));

                    this.blogs.sort(function(a, b) {
                        var valA = parseInt(a.id, 10);
                        var valB = parseInt(b.id, 10);
                        if (isNaN(valA)) valA = a.id;
                        if (isNaN(valB)) valB = b.id;
                        if (valA < valB) return 1;
                        if (valA > valB) return -1;
                        return 0;
                    });

                    if (this.blogs.length > 0) {
                        this._setPersistentCache('mchess_blogs_cache', this.blogs);
                    }
                    this.lastFetchSource.blogs = 'network (' + snap.docs.length + ' doc reads)';
                    this.lastError = null;
                } else {
                    throw e;
                }
            } catch (fallbackErr) {
                this.lastError = fallbackErr;
                console.error("Error fetching mchess blogs:", fallbackErr);
                this.blogs = [];
            }
        }

        return (this.blogs || []).filter(function(b) {
            return b.active === "1" || b.active === 1 || b.active === true || !b.hasOwnProperty('active');
        });
    },

    getCategories: async function (forceRefresh) {
        var isForced = Boolean(forceRefresh || this._hasUrlRefreshParam());

        if (isForced) {
            this.clearCache('categories');
        }

        if (this.categories && Array.isArray(this.categories) && this.categories.length > 0 && !isForced) {
            this.lastFetchSource.categories = 'memory (0 reads)';
            return this.categories;
        }

        if (!isForced) {
            var cached = this._getPersistentCache('mchess_categories_cache');
            if (cached && Array.isArray(cached) && cached.length > 0) {
                this.categories = cached;
                this.lastFetchSource.categories = 'localStorage (0 reads)';
                return this.categories;
            }
        }

        try {
            var blogs = await this.getBlogs(isForced);
            var catSet = new Set();
            blogs.forEach(function(b) {
                if (b.category) catSet.add(b.category);
            });
            this.categories = Array.from(catSet);
            if (this.categories.length > 0) {
                this._setPersistentCache('mchess_categories_cache', this.categories);
            }
            this.lastFetchSource.categories = 'derived from blogs (0 extra reads)';
        } catch (e) {
            console.error("Error loading categories:", e);
            this.categories = [];
        }
        return this.categories;
    }
};
