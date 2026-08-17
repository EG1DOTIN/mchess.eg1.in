// app.js for MCHESS Admin Panel
// ═══════════════════════════════════════════════════════════════════════════════
// Navigation, Dashboard, Blogs (paginated), Categories, Messages (paginated)
// ═══════════════════════════════════════════════════════════════════════════════

// Initialize TinyMCE Editor
function initializeTinyMCE() {
    tinymce.init({
        selector: 'textarea#blogContent,textarea#contentEditor,textarea#productFullDescription',
        plugins: 'image link lists code table codesample',
        toolbar: 'undo redo | styles | formatselect | bold italic underline backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image link code codesample table',
        height: 400,
        image_upload_handler: handleImageUpload,
        file_picker_types: 'image',
        file_picker_callback: function (callback, value, meta) {
            if (meta.filetype === 'image') {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.onchange = async function () {
                    const file = this.files[0];
                    try {
                        const fileName = 'tinymce/' + Date.now() + '_' + file.name;
                        const uploadTask = await firebase.storage().ref(fileName).put(file);
                        const url = await uploadTask.ref.getDownloadURL();
                        callback(url, { title: file.name });
                    } catch (error) {
                        alert('Error uploading image: ' + error.message);
                    }
                };
                input.click();
            }
        }
    });
}

// Handle image upload
async function handleImageUpload(blobInfo, success, failure) {
    try {
        const fileName = 'tinymce/' + Date.now() + '_' + blobInfo.filename();
        const uploadTask = await firebase.storage().ref(fileName).put(blobInfo.blob());
        const url = await uploadTask.ref.getDownloadURL();
        success(url);
    } catch (error) {
        failure('Error uploading image: ' + error.message);
    }
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function loadDashboardStats() {
    fetchAllBlogsFlat().then(function(blogs) {
        document.getElementById('totalBlogs').innerText = blogs.length;
    });
    db.collection('mchess_blog').get().then(function(snap) {
        document.getElementById('totalCategories').innerText = snap.size;
    });
    db.collection('messages').get().then(function(snap) {
        document.getElementById('totalMessages').innerText = snap.size;
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOG – Server-side cursor pagination (18 per page)
// ═══════════════════════════════════════════════════════════════════════════════
var BLOGS_PAGE_SIZE = 18;
var blogsPage = 1;
var blogsHasMore = false;
var allBlogsFlat = [];

async function fetchAllBlogsFlat() {
    var cacheKey = 'mchess_blogs_cache';
    var cachedData = localStorage.getItem(cacheKey);
    var cachedTime = localStorage.getItem(cacheKey + '_time');
    var cacheValid = cachedData && cachedTime && (Date.now() - parseInt(cachedTime) < 3600000);

    if (cacheValid) {
        return JSON.parse(cachedData);
    }

    const snap = await db.collection('mchess_blog').get();
    let blogs = [];
    snap.forEach(doc => {
        const catData = doc.data();
        const catName = doc.id; // Category name
        for (const [key, value] of Object.entries(catData)) {
            if (key.startsWith('page')) {
                for (const [blogId, blogData] of Object.entries(value)) {
                    blogs.push({ id: blogId, _categoryId: catName, _pageKey: key, ...blogData });
                }
            }
        }
    });
    blogs.sort((a, b) => {
        let valA = parseInt(a.id);
        let valB = parseInt(b.id);
        if (isNaN(valA)) valA = a.id;
        if (isNaN(valB)) valB = b.id;
        if (valA < valB) return 1;
        if (valA > valB) return -1;
        return 0;
    });

    localStorage.setItem(cacheKey, JSON.stringify(blogs));
    localStorage.setItem(cacheKey + '_time', Date.now().toString());

    return blogs;
}

function showBlogForm() {
    document.getElementById('blogForm').style.display = 'block';
    document.getElementById('blogFormElement').reset();
    if (typeof tinymce !== 'undefined' && tinymce.get('blogContent')) {
        tinymce.get('blogContent').setContent('');
    }
    document.getElementById('blogId').value = '';
    document.getElementById('blogFormTitle').innerText = 'Add New Blog';
}

function hideBlogForm() {
    document.getElementById('blogForm').style.display = 'none';
}

function loadCategoryDropdown() {
    var sel = document.getElementById('blogCategory');
    var filterSel = document.getElementById('blogFilterCategory');
    sel.innerHTML = '<option value="">Select Category</option>';
    if (filterSel) filterSel.innerHTML = '<option value="">All Categories</option>';
    db.collection('mchess_blog').get().then(function(snap) {
        snap.forEach(function(doc) {
            var cat = doc.id;
            var opt = document.createElement('option');
            opt.value = cat;
            opt.innerText = cat;
            sel.appendChild(opt);
            
            if (filterSel) {
                var filterOpt = document.createElement('option');
                filterOpt.value = cat;
                filterOpt.innerText = cat;
                filterSel.appendChild(filterOpt);
            }
        });
    });
}

document.getElementById('blogFormElement').addEventListener('submit', async function(e) {
    e.preventDefault();
    var id = document.getElementById('blogId').value;
    var originalCategory = document.getElementById('blogFormElement').dataset.originalCategory;
    var originalPageKey = document.getElementById('blogFormElement').dataset.originalPageKey;
    
    var category = document.getElementById('blogCategory').value;
    var fullDescription = '';
    if (typeof tinymce !== 'undefined' && tinymce.get('blogContent')) {
        fullDescription = tinymce.get('blogContent').getContent();
    } else {
        fullDescription = document.getElementById('blogContent').value;
    }

    var blogData = {
        title: document.getElementById('blogTitle').value,
        category: category,
        metaDescription: document.getElementById('blogMetaDescription').value,
        full_description: fullDescription,
        output_image: document.getElementById('blogImageUrl').value,
        release_date: firebase.firestore.FieldValue.serverTimestamp()
    };

    var catRef = db.collection('mchess_blog').doc(category);
    
    if (id) {
        // Editing existing
        if (originalCategory && originalCategory !== category) {
            // Category changed: delete from old category
            var oldRef = db.collection('mchess_blog').doc(originalCategory);
            var deletePayload = {};
            deletePayload[`${originalPageKey}.${id}`] = firebase.firestore.FieldValue.delete();
            await oldRef.update(deletePayload);
        }
        
        if (originalCategory === category && originalPageKey) {
            // Keep in same page
            var updatePayload = {};
            updatePayload[`${originalPageKey}.${id}`] = blogData;
            await catRef.update(updatePayload);
        } else {
            // New category, find place to insert
            await insertIntoCategory(catRef, id, blogData);
        }
    } else {
        // Adding new
        var newId = Date.now().toString();
        await insertIntoCategory(catRef, newId, blogData);
    }
    
    
    hideBlogForm();
    localStorage.removeItem('mchess_blogs_cache');
    localStorage.removeItem('mchess_blogs_cache_time');
    localStorage.removeItem('mchess_categories_cache');
    localStorage.removeItem('mchess_categories_cache_time');
    blogsPage = 1;
    loadBlogsList();
});

async function insertIntoCategory(catRef, id, blogData) {
    var catDoc = await catRef.get();
    var pageToUse = 'page1';
    if (catDoc.exists) {
        var catData = catDoc.data();
        var maxPage = 1;
        for (var key of Object.keys(catData)) {
            if (key.startsWith('page')) {
                var pageNum = parseInt(key.replace('page', ''));
                if (pageNum > maxPage) maxPage = pageNum;
            }
        }
        if (Object.keys(catData['page' + maxPage] || {}).length < 18) {
            pageToUse = 'page' + maxPage;
        } else {
            pageToUse = 'page' + (maxPage + 1);
        }
    }
    var updatePayload = {};
    updatePayload[pageToUse] = {};
    updatePayload[pageToUse][id] = blogData;
    await catRef.set(updatePayload, { merge: true });
}

function loadBlogsList() {
    var tbody = document.getElementById('blogsTableBody');
    tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

    fetchAllBlogsFlat().then(function(blogs) {
        allBlogsFlat = blogs;
        renderBlogsListMemory();
    });
}

function renderBlogsListMemory() {
    var tbody = document.getElementById('blogsTableBody');
    tbody.innerHTML = '';
    
    var filterCat = document.getElementById('blogFilterCategory');
    var selectedCat = filterCat ? filterCat.value : '';
    
    var displayBlogs = allBlogsFlat;
    if (selectedCat !== '') {
        displayBlogs = allBlogsFlat.filter(function(b) { return b.category === selectedCat || b._categoryId === selectedCat; });
    }
    
    if (displayBlogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">No blogs found</td></tr>';
        blogsHasMore = false;
        renderBlogsPagination();
        return;
    }

    var from = (blogsPage - 1) * BLOGS_PAGE_SIZE;
    var to = from + BLOGS_PAGE_SIZE;
    var pageDocs = displayBlogs.slice(from, to);
    blogsHasMore = to < displayBlogs.length;

    pageDocs.forEach(function(data) {
        var dateStr = 'N/A';
        if (data.release_date) {
            var d = data.release_date.toDate ? data.release_date.toDate() : new Date(data.release_date);
            dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
        tbody.innerHTML += '<tr>' +
            '<td>' + (data.title || 'Untitled') + '</td>' +
            '<td>' + (data.category || 'N/A') + '</td>' +
            '<td>' + dateStr + '</td>' +
            '<td class="action-buttons" style="align-items:center;">' +
                '<button class="btn-edit" data-id="' + data.id + '" data-action="edit-blog">Edit</button>' +
                '<button class="btn-delete" data-id="' + data.id + '" data-action="delete-blog">Delete</button>' +
                '<label class="switch" title="Toggle Visibility">' +
                    '<input type="checkbox" data-id="' + data.id + '" data-action="toggle-blog"' +
                        (data.active !== false && data.active !== '0' ? ' checked' : '') + '>' +
                    '<span class="slider round"></span>' +
                '</label>' +
            '</td>' +
        '</tr>';
    });

    renderBlogsPagination(from + 1, Math.min(to, displayBlogs.length));
}

function renderBlogsPagination(from, to) {
    var controls = document.getElementById('blogsPagination');
    if (!controls) return;

    var prevDisabled = blogsPage === 1 ? 'disabled' : '';
    var nextDisabled = !blogsHasMore ? 'disabled' : '';
    var info = (from && to) ? 'Page ' + blogsPage + ' &nbsp;(' + from + '&ndash;' + to + ' shown)' : 'Page ' + blogsPage;

    controls.innerHTML =
        '<span class="pagination-info">' + info + '</span>' +
        '<button class="pg-btn" data-table="blogs" data-dir="prev" ' + prevDisabled + '>&#8249; Prev</button>' +
        '<button class="pg-btn active">' + blogsPage + '</button>' +
        '<button class="pg-btn" data-table="blogs" data-dir="next" ' + nextDisabled + '>Next &#8250;</button>';
}

window.editBlog = function(id) {
    var data = allBlogsFlat.find(b => b.id === id);
    if (data) {
        showBlogForm();
        document.getElementById('blogFormTitle').innerText = 'Edit Blog';
        document.getElementById('blogId').value = data.id;
        document.getElementById('blogTitle').value = data.title || '';
        document.getElementById('blogCategory').value = data.category || '';
        document.getElementById('blogMetaDescription').value = data.metaDescription || '';
        
        if (typeof tinymce !== 'undefined' && tinymce.get('blogContent')) {
            tinymce.get('blogContent').setContent(data.full_description || '');
        } else {
            document.getElementById('blogContent').value = data.full_description || '';
        }
        
        document.getElementById('blogImageUrl').value = data.output_image || '';
        
        document.getElementById('blogFormElement').dataset.originalCategory = data._categoryId;
        document.getElementById('blogFormElement').dataset.originalPageKey = data._pageKey;
    }
};

window.deleteBlog = function(id) {
    if (confirm("Are you sure you want to delete this blog?")) {
        var data = allBlogsFlat.find(b => b.id === id);
        if (data && data._categoryId && data._pageKey) {
            var payload = {};
            payload[`${data._pageKey}.${id}`] = firebase.firestore.FieldValue.delete();
            db.collection('mchess_blog').doc(data._categoryId).update(payload).then(function() {
                localStorage.removeItem('mchess_blogs_cache');
                localStorage.removeItem('mchess_blogs_cache_time');
                localStorage.removeItem('mchess_categories_cache');
                localStorage.removeItem('mchess_categories_cache_time');
                blogsPage = 1;
                loadBlogsList();
            });
        }
    }
};

// Toggle Blog Active Status
window.toggleBlogActive = async function(blogId, isActive) {
    try {
        var data = allBlogsFlat.find(b => b.id === blogId);
        if (data && data._categoryId && data._pageKey) {
            var payload = {};
            // Maintain existing fields but update active
            var updatedBlogData = Object.assign({}, data);
            delete updatedBlogData.id;
            delete updatedBlogData._categoryId;
            delete updatedBlogData._pageKey;
            updatedBlogData.active = isActive ? '1' : '0';
            
            payload[`${data._pageKey}.${blogId}`] = updatedBlogData;
            await db.collection('mchess_blog').doc(data._categoryId).update(payload);
            
            localStorage.removeItem('mchess_blogs_cache');
            localStorage.removeItem('mchess_blogs_cache_time');
            localStorage.removeItem('mchess_categories_cache');
            localStorage.removeItem('mchess_categories_cache_time');
            loadBlogsList();
        }
    } catch (error) {
        console.error('Error updating blog visibility:', error);
        alert('Error updating blog visibility: ' + error.message);
        loadBlogsList();
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// BLOG CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════
var CATEGORIES_PAGE_SIZE = 18;
var categoriesPage = 1;
var categoriesHasMore = false;
var allCategoriesFlat = [];

function showCategoryForm() {
    document.getElementById('categoryForm').style.display = 'block';
    document.getElementById('categoryFormElement').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryFormTitle').innerText = 'Add Category';
}

function hideCategoryForm() {
    document.getElementById('categoryForm').style.display = 'none';
}

document.getElementById('categoryFormElement').addEventListener('submit', function(e) {
    e.preventDefault();
    var oldId = document.getElementById('categoryId').value; // old category name if editing
    var newCategoryName = document.getElementById('categoryName').value;

    var promise;
    if (oldId && oldId !== newCategoryName) {
        // Renaming category involves copying document to new ID and deleting old one, but for simplicity we will not support renaming documents right now or we just alert them it's not supported easily without moving all blogs
        alert("Renaming category is not directly supported because category is the document ID. Please create a new category and re-assign blogs.");
        return;
    } else if (!oldId) {
        // Create new empty category document
        promise = db.collection('mchess_blog').doc(newCategoryName).set({});
    } else {
        promise = Promise.resolve(); // No change in name
    }
    
    if(promise) {
        promise.then(function() {
            hideCategoryForm();
            localStorage.removeItem('mchess_categories_cache');
            categoriesPage = 1;
            loadCategoriesList();
        });
    }
});

function loadCategoriesList() {
    var tbody = document.getElementById('categoriesTableBody');
    tbody.innerHTML = '<tr><td colspan="2">Loading...</td></tr>';
    db.collection('mchess_blog').get().then(function(snap) {
        allCategoriesFlat = [];
        snap.forEach(function(doc) {
            allCategoriesFlat.push({ id: doc.id, category: doc.id });
        });
        renderCategoriesListMemory();
    });
}

function renderCategoriesListMemory() {
    var tbody = document.getElementById('categoriesTableBody');
    tbody.innerHTML = '';
    
    if (allCategoriesFlat.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="no-data">No categories found</td></tr>';
        categoriesHasMore = false;
        renderCategoriesPagination();
        return;
    }

    var from = (categoriesPage - 1) * CATEGORIES_PAGE_SIZE;
    var to = from + CATEGORIES_PAGE_SIZE;
    var pageDocs = allCategoriesFlat.slice(from, to);
    categoriesHasMore = to < allCategoriesFlat.length;

    pageDocs.forEach(function(data) {
        tbody.innerHTML += '<tr>' +
            '<td>' + data.category + '</td>' +
            '<td class="action-buttons">' +
                '<button class="btn-edit" data-id="' + data.id + '" data-name="' + data.category.replace(/'/g, "\\'") + '" data-action="edit-category">Edit</button>' +
                '<button class="btn-delete" data-id="' + data.id + '" data-action="delete-category">Delete</button>' +
            '</td>' +
        '</tr>';
    });

    renderCategoriesPagination(from + 1, Math.min(to, allCategoriesFlat.length));
}

function renderCategoriesPagination(from, to) {
    var controls = document.getElementById('categoriesPagination');
    if (!controls) return;

    var prevDisabled = categoriesPage === 1 ? 'disabled' : '';
    var nextDisabled = !categoriesHasMore ? 'disabled' : '';
    var info = (from && to) ? 'Page ' + categoriesPage + ' &nbsp;(' + from + '&ndash;' + to + ' shown)' : 'Page ' + categoriesPage;

    controls.innerHTML =
        '<span class="pagination-info">' + info + '</span>' +
        '<button class="pg-btn" data-table="categories" data-dir="prev" ' + prevDisabled + '>&#8249; Prev</button>' +
        '<button class="pg-btn active">' + categoriesPage + '</button>' +
        '<button class="pg-btn" data-table="categories" data-dir="next" ' + nextDisabled + '>Next &#8250;</button>';
}

window.editCategory = function(id, name) {
    showCategoryForm();
    document.getElementById('categoryFormTitle').innerText = 'Edit Category';
    document.getElementById('categoryId').value = id;
    document.getElementById('categoryName').value = name;
};

window.deleteCategory = function(id) {
    if (confirm("Are you sure you want to delete this category? This will delete all blogs inside it!")) {
        db.collection('mchess_blog').doc(id).delete().then(function() {
            localStorage.removeItem('mchess_categories_cache');
            categoriesPage = 1;
            loadCategoriesList();
        });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGES – Server-side cursor pagination (18 per page)
// ═══════════════════════════════════════════════════════════════════════════════
var MESSAGES_PAGE_SIZE = 18;
var messagesCursors = [null];
var messagesPage = 1;
var messagesHasMore = false;

function loadMessagesList() {
    var tbody = document.getElementById('messagesTableBody');
    tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

    var query = db.collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(MESSAGES_PAGE_SIZE + 1);

    var cursorDoc = messagesCursors[messagesPage - 1];
    if (cursorDoc) {
        query = query.startAfter(cursorDoc);
    }

    query.get().then(function(snap) {
        tbody.innerHTML = '';
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No messages found</td></tr>';
            messagesHasMore = false;
            renderMessagesPagination();
            return;
        }

        var docs = snap.docs;
        messagesHasMore = docs.length > MESSAGES_PAGE_SIZE;
        var pageDocs = messagesHasMore ? docs.slice(0, MESSAGES_PAGE_SIZE) : docs;

        if (messagesHasMore) {
            messagesCursors[messagesPage] = pageDocs[pageDocs.length - 1];
        }

        var from = (messagesPage - 1) * MESSAGES_PAGE_SIZE + 1;
        var to = from + pageDocs.length - 1;

        pageDocs.forEach(function(doc) {
            var data = doc.data();
            var dateStr = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : 'N/A';
            var msgPreview = data.message ? data.message.substring(0, 50) + '...' : '-';
            tbody.innerHTML += '<tr>' +
                '<td>' + (data.name || '-') + '</td>' +
                '<td>' + (data.email || '-') + '</td>' +
                '<td>' + (data.contact || '-') + '</td>' +
                '<td>' + dateStr + '</td>' +
                '<td>' + msgPreview + '</td>' +
                '<td class="action-buttons">' +
                    '<button class="btn-delete" data-id="' + doc.id + '" data-action="delete-message">Delete</button>' +
                '</td>' +
            '</tr>';
        });

        renderMessagesPagination(from, to);
    });
}

function renderMessagesPagination(from, to) {
    var controls = document.getElementById('messagesPagination');
    if (!controls) return;

    var prevDisabled = messagesPage === 1 ? 'disabled' : '';
    var nextDisabled = !messagesHasMore ? 'disabled' : '';
    var info = (from && to) ? 'Page ' + messagesPage + ' &nbsp;(' + from + '&ndash;' + to + ' shown)' : 'Page ' + messagesPage;

    controls.innerHTML =
        '<span class="pagination-info">' + info + '</span>' +
        '<button class="pg-btn" data-table="messages" data-dir="prev" ' + prevDisabled + '>&#8249; Prev</button>' +
        '<button class="pg-btn active">' + messagesPage + '</button>' +
        '<button class="pg-btn" data-table="messages" data-dir="next" ' + nextDisabled + '>Next &#8250;</button>';
}

window.deleteMessage = function(id) {
    if (confirm("Are you sure you want to delete this message?")) {
        db.collection('messages').doc(id).delete().then(function() {
            messagesCursors = [null]; messagesPage = 1; messagesHasMore = false;
            loadMessagesList();
        });
    }
};

// Delegated event handler for pagination + table actions
document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action], [data-table][data-dir]');
    if (!btn) return;

    var action = btn.dataset.action;
    var id     = btn.dataset.id;

    // Table row actions
    if (action === 'edit-blog')       { editBlog(id);    return; }
    if (action === 'delete-blog')     { deleteBlog(id);  return; }
    if (action === 'delete-message')  { deleteMessage(id);  return; }
    if (action === 'edit-category')   { editCategory(id, btn.dataset.name); return; }
    if (action === 'delete-category') { deleteCategory(id); return; }

    // Pagination Prev / Next
    var table = btn.dataset.table;
    var dir   = btn.dataset.dir;
    if (!table || !dir || btn.disabled || btn.hasAttribute('disabled')) return;

    if (table === 'blogs') {
        if (dir === 'next') { blogsPage++;                        renderBlogsListMemory(); }
        if (dir === 'prev') { blogsPage = Math.max(1, blogsPage - 1); renderBlogsListMemory(); }
    }
    if (table === 'categories') {
        if (dir === 'next') { categoriesPage++;                            renderCategoriesListMemory(); }
        if (dir === 'prev') { categoriesPage = Math.max(1, categoriesPage - 1); renderCategoriesListMemory(); }
    }
    if (table === 'messages') {
        if (dir === 'next') { messagesPage++;                            loadMessagesList(); }
        if (dir === 'prev') { messagesPage = Math.max(1, messagesPage - 1); loadMessagesList(); }
    }
});

document.addEventListener('change', function (e) {
    var el = e.target;
    if (!el.dataset.action) return;
    if (el.dataset.action === 'toggle-blog') { toggleBlogActive(el.dataset.id, el.checked); return; }
});

console.log('Admin module loaded');
