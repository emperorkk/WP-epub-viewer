/**
 * WP-kko EPUB Viewer \u2014 Front-end reader powered by epub.js
 */
(function () {
    'use strict';

    var STORAGE_PREFIX = 'wpkko_epub_';

    /**
     * Initialize all viewer instances on the page.
     */
    function init() {
        var viewers = document.querySelectorAll('.wpkko-epub-viewer');
        viewers.forEach(function (container) {
            new EPUBReader(container);
        });
    }

    /**
     * EPUBReader class \u2014 one instance per viewer.
     */
    function EPUBReader(container) {
        this.container = container;
        this.src       = container.getAttribute('data-epub-src');
        this.skin      = container.getAttribute('data-epub-skin');
        this.bookId    = this.hashCode(this.src);
        this.fontSize  = 100;
        this.bookmarks = [];
        this.book      = null;
        this.rendition = null;

        this.elements = {
            readerArea:      container.querySelector('.wpkko-reader-area'),
            loading:         container.querySelector('.wpkko-loading'),
            pageInfo:        container.querySelector('.wpkko-page-info'),
            tocSidebar:      container.querySelector('.wpkko-toc-sidebar'),
            tocList:         container.querySelector('.wpkko-toc-list'),
            searchPanel:     container.querySelector('.wpkko-search-panel'),
            searchInput:     container.querySelector('.wpkko-search-input'),
            searchResults:   container.querySelector('.wpkko-search-results'),
            bookmarksPanel:  container.querySelector('.wpkko-bookmarks-panel'),
            bookmarksList:   container.querySelector('.wpkko-bookmarks-list'),
            skinSwitcher:    container.querySelector('.wpkko-skin-switcher'),
        };

        this.bindToolbar();
        this.loadBook();
    }

    EPUBReader.prototype.hashCode = function (str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            var chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return 'epub_' + Math.abs(hash);
    };

    EPUBReader.prototype.bindToolbar = function () {
        var self = this;
        var c    = this.container;

        c.querySelector('.wpkko-btn-prev').addEventListener('click', function () {
            if (self.rendition) self.rendition.prev();
        });

        c.querySelector('.wpkko-btn-next').addEventListener('click', function () {
            if (self.rendition) self.rendition.next();
        });

        c.querySelector('.wpkko-btn-toc').addEventListener('click', function () {
            self.togglePanel('tocSidebar');
        });

        c.querySelector('.wpkko-btn-toc-close').addEventListener('click', function () {
            self.elements.tocSidebar.style.display = 'none';
        });

        c.querySelector('.wpkko-btn-font-down').addEventListener('click', function () {
            self.changeFontSize(-10);
        });

        c.querySelector('.wpkko-btn-font-up').addEventListener('click', function () {
            self.changeFontSize(10);
        });

        c.querySelector('.wpkko-btn-bookmark').addEventListener('click', function () {
            self.addBookmark();
        });

        c.querySelector('.wpkko-btn-search').addEventListener('click', function () {
            self.togglePanel('searchPanel');
        });

        c.querySelector('.wpkko-btn-search-close').addEventListener('click', function () {
            self.elements.searchPanel.style.display = 'none';
        });

        c.querySelector('.wpkko-btn-fullscreen').addEventListener('click', function () {
            self.toggleFullscreen();
        });

        // Search on enter.
        this.elements.searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                self.doSearch(e.target.value);
            }
        });

        // Bookmark panel \u2014 click the bookmark button to toggle.
        c.querySelector('.wpkko-btn-bookmark').addEventListener('dblclick', function () {
            self.togglePanel('bookmarksPanel');
            self.renderBookmarks();
        });

        c.querySelector('.wpkko-btn-bookmarks-close').addEventListener('click', function () {
            self.elements.bookmarksPanel.style.display = 'none';
        });

        // Skin switcher.
        this.elements.skinSwitcher.addEventListener('change', function () {
            self.changeSkin(this.value);
        });

        // Keyboard navigation.
        document.addEventListener('keydown', function (e) {
            if (!self.isActive()) return;
            if (e.key === 'ArrowLeft')  { self.rendition && self.rendition.prev(); }
            if (e.key === 'ArrowRight') { self.rendition && self.rendition.next(); }
        });
    };

    EPUBReader.prototype.isActive = function () {
        return this.container.matches(':hover') ||
               document.fullscreenElement === this.container;
    };

    EPUBReader.prototype.togglePanel = function (panelKey) {
        var panel = this.elements[panelKey];
        var panels = ['tocSidebar', 'searchPanel', 'bookmarksPanel'];
        var self = this;
        panels.forEach(function (key) {
            if (key !== panelKey) {
                self.elements[key].style.display = 'none';
            }
        });
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    };

    EPUBReader.prototype.loadBook = function () {
        var self = this;

        if (typeof ePub === 'undefined') {
            self.elements.loading.innerHTML = '<p style="color:red;">Error: epub.js library failed to load.</p>';
            console.error('WP-kko EPUB Viewer: ePub is not defined. The epub.js CDN may be blocked.');
            return;
        }

        this.book = ePub(this.src);
        this.rendition = this.book.renderTo(this.elements.readerArea, {
            width:  '100%',
            height: '100%',
            spread: 'auto'
        });

        // Load saved progress or start from the beginning.
        this.loadProgress(function (location) {
            if (location) {
                self.rendition.display(location);
            } else {
                self.rendition.display();
            }
        });

        this.book.ready.then(function () {
            self.elements.loading.style.display = 'none';
            return self.book.locations.generate(1024);
        }).then(function () {
            self.updatePageInfo();
        }).catch(function (err) {
            console.error('WP-kko EPUB Viewer: Failed to load book', err);
            self.elements.loading.innerHTML = '<p style="color:red;">Failed to load EPUB file. Check the console for details.</p>';
        });

        this.rendition.on('relocated', function (location) {
            self.updatePageInfo(location);
            self.saveProgress(location.start.cfi);
        });

        // Swipe support for touch devices.
        this.rendition.on('touchstart', function (e) {
            self._touchStartX = e.changedTouches[0].screenX;
        });

        this.rendition.on('touchend', function (e) {
            var diff = self._touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) self.rendition.next();
                else self.rendition.prev();
            }
        });

        // Build TOC.
        this.book.loaded.navigation.then(function (nav) {
            self.buildTOC(nav.toc);
        });

        // Load bookmarks.
        self.loadBookmarks();
    };

    EPUBReader.prototype.updatePageInfo = function (location) {
        if (!this.book.locations || !location) {
            this.elements.pageInfo.textContent = '';
            return;
        }
        var current = this.book.locations.percentageFromCfi(location.start.cfi);
        var pct = Math.round(current * 100);
        this.elements.pageInfo.textContent = pct + '%';
    };

    EPUBReader.prototype.buildTOC = function (toc) {
        var self = this;
        this.elements.tocList.innerHTML = '';

        function buildItems(items, parentUl) {
            items.forEach(function (item) {
                var li = document.createElement('li');
                var a  = document.createElement('a');
                a.textContent = item.label.trim();
                a.href = '#';
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    self.rendition.display(item.href);
                    self.elements.tocSidebar.style.display = 'none';
                });
                li.appendChild(a);

                if (item.subitems && item.subitems.length) {
                    var subUl = document.createElement('ul');
                    buildItems(item.subitems, subUl);
                    li.appendChild(subUl);
                }
                parentUl.appendChild(li);
            });
        }

        buildItems(toc, this.elements.tocList);
    };

    EPUBReader.prototype.changeFontSize = function (delta) {
        this.fontSize = Math.max(50, Math.min(200, this.fontSize + delta));
        this.rendition.themes.fontSize(this.fontSize + '%');
    };

    EPUBReader.prototype.changeSkin = function (skin) {
        // Remove old skin class.
        var classes = this.container.className.split(' ').filter(function (cls) {
            return cls.indexOf('wpkko-skin-') !== 0;
        });
        classes.push('wpkko-skin-' + skin);
        this.container.className = classes.join(' ');
        this.skin = skin;
        this.container.setAttribute('data-epub-skin', skin);
    };

    // --- Bookmarks ---

    EPUBReader.prototype.addBookmark = function () {
        if (!this.rendition || !this.rendition.location) return;
        var cfi = this.rendition.location.start.cfi;

        // Check duplicate.
        for (var i = 0; i < this.bookmarks.length; i++) {
            if (this.bookmarks[i].cfi === cfi) {
                this.showToast(wpkkoEpub.i18n.bookmarkExists);
                return;
            }
        }

        var pct = '';
        if (this.book.locations) {
            pct = Math.round(this.book.locations.percentageFromCfi(cfi) * 100) + '%';
        }

        this.bookmarks.push({
            cfi:   cfi,
            label: pct || 'Bookmark',
            date:  new Date().toLocaleString()
        });

        this.saveBookmarks();
        this.showToast(wpkkoEpub.i18n.bookmarkAdded);
    };

    EPUBReader.prototype.renderBookmarks = function () {
        var self = this;
        this.elements.bookmarksList.innerHTML = '';

        if (!this.bookmarks.length) {
            var li = document.createElement('li');
            li.textContent = 'No bookmarks yet.';
            li.className = 'wpkko-no-bookmarks';
            this.elements.bookmarksList.appendChild(li);
            return;
        }

        this.bookmarks.forEach(function (bm, idx) {
            var li = document.createElement('li');

            var a = document.createElement('a');
            a.href = '#';
            a.textContent = bm.label + ' \u2014 ' + bm.date;
            a.addEventListener('click', function (e) {
                e.preventDefault();
                self.rendition.display(bm.cfi);
                self.elements.bookmarksPanel.style.display = 'none';
            });

            var del = document.createElement('button');
            del.className = 'wpkko-btn wpkko-btn-delete-bookmark';
            del.textContent = '\u00D7';
            del.addEventListener('click', function () {
                self.bookmarks.splice(idx, 1);
                self.saveBookmarks();
                self.renderBookmarks();
            });

            li.appendChild(a);
            li.appendChild(del);
            self.elements.bookmarksList.appendChild(li);
        });
    };

    // --- Search ---

    EPUBReader.prototype.doSearch = function (query) {
        var self = this;
        this.elements.searchResults.innerHTML = '';

        if (!query || query.length < 2) return;

        var results = [];
        var spine = this.book.spine;

        // We need to search through each section.
        Promise.all(
            spine.spineItems.map(function (item) {
                return item.load(self.book.load.bind(self.book)).then(function (doc) {
                    var text = doc.body ? doc.body.textContent : '';
                    var idx = text.toLowerCase().indexOf(query.toLowerCase());
                    if (idx !== -1) {
                        var excerpt = text.substring(Math.max(0, idx - 40), idx + query.length + 40);
                        results.push({
                            cfi:     item.href,
                            excerpt: '...' + excerpt.trim() + '...'
                        });
                    }
                    item.unload();
                });
            })
        ).then(function () {
            if (!results.length) {
                var li = document.createElement('li');
                li.textContent = wpkkoEpub.i18n.noResults;
                li.className = 'wpkko-no-results';
                self.elements.searchResults.appendChild(li);
                return;
            }

            results.forEach(function (r) {
                var li = document.createElement('li');
                var a = document.createElement('a');
                a.href = '#';
                a.textContent = r.excerpt;
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    self.rendition.display(r.cfi);
                    self.elements.searchPanel.style.display = 'none';
                });
                li.appendChild(a);
                self.elements.searchResults.appendChild(li);
            });
        });
    };

    // --- Fullscreen ---

    EPUBReader.prototype.toggleFullscreen = function () {
        if (document.fullscreenElement === this.container) {
            document.exitFullscreen();
        } else {
            this.container.requestFullscreen().catch(function () {});
        }
    };

    // --- Persistence (AJAX for logged-in, localStorage fallback) ---

    EPUBReader.prototype.saveBookmarks = function () {
        var data = JSON.stringify(this.bookmarks);

        // Always save to localStorage as fallback.
        try { localStorage.setItem(STORAGE_PREFIX + 'bm_' + this.bookId, data); } catch (e) {}

        // AJAX save for logged-in users.
        if (wpkkoEpub.nonce) {
            var fd = new FormData();
            fd.append('action', 'wpkko_save_bookmarks');
            fd.append('nonce', wpkkoEpub.nonce);
            fd.append('book_id', this.bookId);
            fd.append('bookmarks', data);
            fetch(wpkkoEpub.ajaxUrl, { method: 'POST', body: fd, credentials: 'same-origin' });
        }
    };

    EPUBReader.prototype.loadBookmarks = function () {
        var self = this;

        // Try AJAX first.
        if (wpkkoEpub.nonce) {
            var url = wpkkoEpub.ajaxUrl + '?action=wpkko_load_bookmarks&nonce=' +
                      encodeURIComponent(wpkkoEpub.nonce) + '&book_id=' +
                      encodeURIComponent(this.bookId);

            fetch(url, { credentials: 'same-origin' })
                .then(function (r) { return r.json(); })
                .then(function (resp) {
                    if (resp.success && resp.data && resp.data !== '[]') {
                        try { self.bookmarks = JSON.parse(resp.data); } catch (e) {}
                    } else {
                        self.loadBookmarksFromStorage();
                    }
                })
                .catch(function () {
                    self.loadBookmarksFromStorage();
                });
        } else {
            this.loadBookmarksFromStorage();
        }
    };

    EPUBReader.prototype.loadBookmarksFromStorage = function () {
        try {
            var raw = localStorage.getItem(STORAGE_PREFIX + 'bm_' + this.bookId);
            if (raw) this.bookmarks = JSON.parse(raw);
        } catch (e) {}
    };

    EPUBReader.prototype.saveProgress = function (cfi) {
        try { localStorage.setItem(STORAGE_PREFIX + 'loc_' + this.bookId, cfi); } catch (e) {}

        if (wpkkoEpub.nonce) {
            var fd = new FormData();
            fd.append('action', 'wpkko_save_progress');
            fd.append('nonce', wpkkoEpub.nonce);
            fd.append('book_id', this.bookId);
            fd.append('location', cfi);
            fetch(wpkkoEpub.ajaxUrl, { method: 'POST', body: fd, credentials: 'same-origin' });
        }
    };

    EPUBReader.prototype.loadProgress = function (callback) {
        var self = this;

        if (wpkkoEpub.nonce) {
            var url = wpkkoEpub.ajaxUrl + '?action=wpkko_load_progress&nonce=' +
                      encodeURIComponent(wpkkoEpub.nonce) + '&book_id=' +
                      encodeURIComponent(this.bookId);

            fetch(url, { credentials: 'same-origin' })
                .then(function (r) { return r.json(); })
                .then(function (resp) {
                    if (resp.success && resp.data) {
                        callback(resp.data);
                    } else {
                        callback(self.loadProgressFromStorage());
                    }
                })
                .catch(function () {
                    callback(self.loadProgressFromStorage());
                });
        } else {
            callback(this.loadProgressFromStorage());
        }
    };

    EPUBReader.prototype.loadProgressFromStorage = function () {
        try {
            return localStorage.getItem(STORAGE_PREFIX + 'loc_' + this.bookId) || null;
        } catch (e) {
            return null;
        }
    };

    // --- Toast notification ---

    EPUBReader.prototype.showToast = function (msg) {
        var toast = document.createElement('div');
        toast.className = 'wpkko-toast';
        toast.textContent = msg;
        this.container.appendChild(toast);
        setTimeout(function () {
            toast.classList.add('wpkko-toast-fade');
            setTimeout(function () { toast.remove(); }, 400);
        }, 1500);
    };

    // --- Boot ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
