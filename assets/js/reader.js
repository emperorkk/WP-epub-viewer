/**
 * WP-kko EPUB Viewer — Front-end reader powered by epub.js
 */
(function () {
    'use strict';

    var STORAGE_PREFIX = 'wpkko_epub_';

    var TEXT_COLORS = [
        { name: 'Auto',  value: null },
        { name: 'White', value: '#ffffff' },
        { name: 'Black', value: '#000000' },
        { name: 'Teal',  value: '#008080' },
        { name: 'Red',   value: '#cc0000' },
        { name: 'Green', value: '#228B22' }
    ];

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
     * EPUBReader class — one instance per viewer.
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
        this.textColorIndex = 0; // 0 = Auto
        this._skinBg    = null;
        this._skinColor = null;

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

        // Text color cycling button.
        c.querySelector('.wpkko-btn-text-color').addEventListener('click', function () {
            self.cycleTextColor();
        });

        // Search on enter.
        this.elements.searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                self.doSearch(e.target.value);
            }
        });

        // Search "Go" button (may not exist in cached HTML).
        var searchGoBtn = c.querySelector('.wpkko-btn-search-go');
        if (searchGoBtn) {
            searchGoBtn.addEventListener('click', function () {
                self.doSearch(self.elements.searchInput.value);
            });
        }

        // Bookmark panel — click the bookmark button to toggle.
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

    /**
     * Get pixel dimensions for the reader area to avoid epub.js
     * setting invalid CSS values from percentage-based sizing.
     */
    EPUBReader.prototype.getReaderDimensions = function () {
        var rect = this.elements.readerArea.getBoundingClientRect();
        var w = Math.floor(rect.width) || 600;
        var h = Math.floor(rect.height) || 400;
        return { width: w, height: h };
    };

    EPUBReader.prototype.loadBook = function () {
        var self = this;

        if (typeof ePub === 'undefined') {
            self.elements.loading.innerHTML = '<p style="color:red;">Error: epub.js library failed to load.</p>';
            console.error('WP-kko EPUB Viewer: ePub is not defined. The epub.js CDN may be blocked.');
            return;
        }

        console.log('WP-kko EPUB Viewer: Loading book from', this.src);

        var dims = this.getReaderDimensions();

        this.book = ePub(this.src, { openAs: 'epub' });
        this.rendition = this.book.renderTo(this.elements.readerArea, {
            width:  dims.width,
            height: dims.height,
            spread: 'auto'
        });

        // Resize rendition when the container resizes.
        var resizeTimer;
        var ro = new ResizeObserver(function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (self.rendition) {
                    var d = self.getReaderDimensions();
                    self.rendition.resize(d.width, d.height);
                }
            }, 150);
        });
        ro.observe(this.elements.readerArea);

        // Loading timeout — if the book doesn't render within 20 seconds, show error.
        var loadingTimeout = setTimeout(function () {
            if (self.elements.loading.style.display !== 'none') {
                console.error('WP-kko EPUB Viewer: Loading timed out after 20 seconds.');
                self.elements.loading.innerHTML =
                    '<p style="color:red;">Loading timed out. The EPUB file may be blocked by CORS, ' +
                    'corrupted, or the server may not be responding. Check the browser console for details.</p>';
            }
        }, 20000);

        // Register content hook early — injects skin CSS into every chapter.
        this.rendition.hooks.content.register(function (contents) {
            var css = self._buildSkinCss();
            if (css) {
                contents.addStylesheetCss(css, 'wpkko-skin');
            }
        });

        // Hide loading as soon as the first page renders.
        this.rendition.on('displayed', function () {
            clearTimeout(loadingTimeout);
            self.elements.loading.style.display = 'none';
        });

        // Wait for book to be ready, then display and generate locations.
        this.book.ready.then(function () {
            console.log('WP-kko EPUB Viewer: Book ready, loading progress...');
            return self.loadProgressAsync();
        }).then(function (savedLocation) {
            console.log('WP-kko EPUB Viewer: Displaying book...');
            if (savedLocation) {
                return self.rendition.display(savedLocation);
            }
            return self.rendition.display();
        }).then(function () {
            // Apply skin background + auto text color into the epub iframe.
            self.applySkinToRendition();
            console.log('WP-kko EPUB Viewer: Generating locations...');
            return self.book.locations.generate(1024);
        }).then(function () {
            self.updatePageInfo();
        }).catch(function (err) {
            clearTimeout(loadingTimeout);
            console.error('WP-kko EPUB Viewer: Failed to load book', err);
            self.elements.loading.innerHTML = '<p style="color:red;">Failed to load EPUB file. Check the console for details.</p>';
        });

        // Build TOC + log spine for debugging navigation issues.
        this.book.loaded.navigation.then(function (nav) {
            console.log('WP-kko EPUB Viewer: Spine items (' + self.book.spine.spineItems.length + '):',
                self.book.spine.spineItems.map(function (s) { return s.href; }));
            console.log('WP-kko EPUB Viewer: TOC items:', nav.toc.map(function (t) {
                return { label: t.label.trim(), href: t.href, id: t.id };
            }));
            self.buildTOC(nav.toc);
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

        // Load bookmarks.
        self.loadBookmarks();
    };

    // --- Skin → epub iframe ---

    /**
     * Build CSS to inject into the epub iframe for skin colors + font size.
     *
     * Font scaling forces all text elements to use relative em units (stripping
     * any absolute px sizes from the EPUB stylesheet), then scales via html
     * font-size. This preserves heading/body proportions while ensuring ALL
     * text responds to the font-size control.
     */
    EPUBReader.prototype._buildSkinCss = function () {
        var colorRules = [];
        var css = '';

        if (this._skinBg) {
            colorRules.push('background-color: ' + this._skinBg + ' !important');
        }
        if (this._skinColor) {
            colorRules.push('color: ' + this._skinColor + ' !important');
        }
        if (colorRules.length) {
            css += 'body, body * { ' + colorRules.join('; ') + '; }\n';
        }

        // Font scaling: set root font-size and force all elements to relative units.
        if (this.fontSize !== 100) {
            css += 'html { font-size: ' + this.fontSize + '% !important; }\n';
            // Reset all elements to 1em (inherit from parent) so px sizes don't block scaling.
            css += 'body * { font-size: 1em !important; }\n';
            // Restore heading proportions (higher specificity than body *).
            css += 'body h1 { font-size: 2em !important; }\n';
            css += 'body h2 { font-size: 1.5em !important; }\n';
            css += 'body h3 { font-size: 1.17em !important; }\n';
            css += 'body h4 { font-size: 1em !important; }\n';
            css += 'body h5 { font-size: 0.83em !important; }\n';
            css += 'body h6 { font-size: 0.67em !important; }\n';
            css += 'body small, body sub, body sup { font-size: 0.8em !important; }\n';
        }
        return css;
    };

    /**
     * Push the current skin's background color into the epub iframe
     * and pick a matching text color.
     */
    EPUBReader.prototype.applySkinToRendition = function () {
        if (!this.rendition) return;

        var bg = window.getComputedStyle(this.container).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            this._skinBg = bg;
        }

        // Apply text color: manual override or auto-detect.
        if (this.textColorIndex === 0) {
            this.autoDetectTextColor();
        } else {
            this.applyTextColor(TEXT_COLORS[this.textColorIndex].value);
        }
    };

    // --- Text color ---

    EPUBReader.prototype.cycleTextColor = function () {
        this.textColorIndex = (this.textColorIndex + 1) % TEXT_COLORS.length;
        var entry = TEXT_COLORS[this.textColorIndex];

        if (entry.value === null) {
            // Auto mode — detect from background.
            this.autoDetectTextColor();
            this.showToast('Text: Auto');
        } else {
            this.applyTextColor(entry.value);
            this.showToast('Text: ' + entry.name);
        }
    };

    EPUBReader.prototype.applyTextColor = function (color) {
        if (!this.rendition) return;
        this._skinColor = color;
        this._injectSkinCss();
    };

    /**
     * Inject (or update) the skin CSS into the current epub iframe view.
     * The content hook (registered in loadBook) handles future chapters.
     */
    EPUBReader.prototype._injectSkinCss = function () {
        if (!this.rendition) return;
        var css = this._buildSkinCss();
        if (!css) return;

        var contents = this.rendition.getContents();
        contents.forEach(function (c) {
            c.addStylesheetCss(css, 'wpkko-skin');
        });
    };

    /**
     * Detect the skin background color and pick a text color
     * that provides good contrast for readability.
     */
    EPUBReader.prototype.autoDetectTextColor = function () {
        if (!this.rendition) return;

        var bgColor = this._skinBg || window.getComputedStyle(this.container).backgroundColor;

        if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            return; // Can't detect, leave as-is.
        }

        var lum = this.getLuminance(bgColor);
        // Dark background → white text; light background → black text.
        var bestColor = lum < 0.5 ? '#ffffff' : '#000000';
        this._skinColor = bestColor;
        this._injectSkinCss();
    };

    /**
     * Parse an rgb/rgba CSS color string and return its relative luminance (0–1).
     */
    EPUBReader.prototype.getLuminance = function (cssColor) {
        var m = cssColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (!m) return 0.5; // Unknown format — assume mid-tone.
        var r = parseInt(m[1], 10) / 255;
        var g = parseInt(m[2], 10) / 255;
        var b = parseInt(m[3], 10) / 255;
        // sRGB luminance formula.
        r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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
                    self.navigateToTocItem(item);
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

    /**
     * Navigate to a TOC item.
     *
     * For single-spine EPUBs where TOC hrefs have no meaningful fragment IDs
     * (e.g. all entries are "file.xhtml#"), we fall back to scanning the
     * content for headings that match the TOC label, generate a CFI, and
     * navigate by CFI for exact positioning.
     */
    EPUBReader.prototype.navigateToTocItem = function (item) {
        var self = this;
        var href = item.href.replace(/#$/, '');
        var fragment = item.href.split('#')[1] || '';
        var tocLabel = item.label.trim();

        console.log('WP-kko EPUB Viewer: TOC click, label:', JSON.stringify(tocLabel),
                     'raw href:', JSON.stringify(item.href), 'fragment:', JSON.stringify(fragment));

        // If the href has a real fragment (not empty), try direct navigation first.
        if (fragment) {
            this.rendition.display(href).then(function () {
                console.log('WP-kko EPUB Viewer: TOC direct navigation OK');
            }).catch(function () {
                // Fragment navigation failed, fall back to heading match.
                self.navigateByHeadingMatch(tocLabel);
            });
        } else {
            // No fragment — scan content for matching heading.
            this.navigateByHeadingMatch(tocLabel);
        }
    };

    /**
     * Find a heading in the EPUB content that matches the TOC label text,
     * generate a CFI for it, and navigate there.
     */
    EPUBReader.prototype.navigateByHeadingMatch = function (tocLabel) {
        var self = this;
        var normalizedLabel = tocLabel.toLowerCase().replace(/\s+/g, ' ').trim();

        console.log('WP-kko EPUB Viewer: Searching content for heading:', normalizedLabel);

        // Search all spine sections for a matching heading.
        var found = false;
        var chain = Promise.resolve();

        this.book.spine.spineItems.forEach(function (spineItem) {
            chain = chain.then(function () {
                if (found) return;
                return spineItem.load(self.book.load.bind(self.book)).then(function (el) {
                    if (found || !el || !el.querySelectorAll) return;

                    var headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    for (var i = 0; i < headings.length; i++) {
                        var headingText = headings[i].textContent.toLowerCase().replace(/\s+/g, ' ').trim();
                        if (headingText === normalizedLabel || headingText.indexOf(normalizedLabel) !== -1 ||
                            normalizedLabel.indexOf(headingText) !== -1) {
                            // Found matching heading — generate CFI.
                            try {
                                var cfi = spineItem.cfiFromElement(headings[i]);
                                if (cfi) {
                                    console.log('WP-kko EPUB Viewer: Found heading match, CFI:', cfi);
                                    found = true;
                                    self.rendition.display(cfi);
                                    return;
                                }
                            } catch (e) {
                                console.warn('WP-kko EPUB Viewer: cfiFromElement failed:', e);
                            }
                        }
                    }
                    spineItem.unload();
                }).catch(function (err) {
                    console.warn('WP-kko EPUB Viewer: Failed to load section for heading search:', err);
                });
            });
        });

        chain.then(function () {
            if (!found) {
                console.warn('WP-kko EPUB Viewer: No heading match found for:', tocLabel);
                self.showToast('Chapter not found in content');
            }
        });
    };

    EPUBReader.prototype.changeFontSize = function (delta) {
        this.fontSize = Math.max(50, Math.min(200, this.fontSize + delta));
        this._injectSkinCss();
        // Re-render current page so epub.js recalculates pagination for new text size.
        if (this.rendition && this.rendition.location) {
            var cfi = this.rendition.location.start.cfi;
            this.rendition.display(cfi);
        }
        this.showToast('Font: ' + this.fontSize + '%');
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

        // Push the new skin's background + text color into the epub iframe.
        var self = this;
        setTimeout(function () { self.applySkinToRendition(); }, 50);
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

        console.log('WP-kko EPUB Viewer: Searching for "' + query + '" across', spine.spineItems.length, 'sections');

        // Show searching indicator.
        var searching = document.createElement('li');
        searching.textContent = 'Searching...';
        searching.className = 'wpkko-no-results';
        this.elements.searchResults.appendChild(searching);

        // Search through each section using epub.js Section.find() for CFI results,
        // with fallback to manual text extraction for older epub.js builds.
        var searchPromise = Promise.all(
            spine.spineItems.map(function (item) {
                return item.load(self.book.load.bind(self.book)).then(function (el) {
                    // Try epub.js built-in find() — returns [{cfi, excerpt}].
                    var found = false;
                    try {
                        if (typeof item.find === 'function') {
                            var cfiResults = item.find(query);
                            if (cfiResults && cfiResults.length) {
                                cfiResults.slice(0, 10).forEach(function (r) {
                                    results.push({
                                        cfi:     r.cfi,
                                        href:    item.href,
                                        excerpt: r.excerpt
                                    });
                                });
                                found = true;
                            }
                        }
                    } catch (e) {
                        console.warn('WP-kko EPUB Viewer: Section.find() failed, using fallback', e);
                    }

                    // Fallback: manual text search (no CFI — can only navigate to section).
                    if (!found) {
                        var text = '';
                        if (el && el.querySelector) {
                            var body = el.querySelector('body');
                            text = body ? body.textContent : (el.textContent || '');
                        } else if (el) {
                            text = el.textContent || '';
                        }
                        var lowerText = text.toLowerCase();
                        var lowerQuery = query.toLowerCase();
                        var idx = 0;
                        var count = 0;
                        while ((idx = lowerText.indexOf(lowerQuery, idx)) !== -1 && count < 10) {
                            var excerpt = text.substring(Math.max(0, idx - 40), idx + query.length + 40);
                            results.push({
                                cfi:     null,
                                href:    item.href,
                                excerpt: '...' + excerpt.trim() + '...'
                            });
                            idx += lowerQuery.length;
                            count++;
                        }
                    }
                    item.unload();
                }).catch(function (err) {
                    console.warn('WP-kko EPUB Viewer: Search failed for section', item.href, err);
                });
            })
        );

        searchPromise.then(function () {
            self.elements.searchResults.innerHTML = '';

            console.log('WP-kko EPUB Viewer: Search complete, found', results.length, 'results',
                        '(CFI:', results.filter(function (r) { return !!r.cfi; }).length + ')');

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
                    // Navigate by CFI (exact position) if available, else by section href.
                    var target = r.cfi || r.href;
                    console.log('WP-kko EPUB Viewer: Search result click, target:', target);
                    self.rendition.display(target);
                    self.elements.searchPanel.style.display = 'none';
                });
                li.appendChild(a);
                self.elements.searchResults.appendChild(li);
            });
        }).catch(function (err) {
            console.error('WP-kko EPUB Viewer: Search error', err);
            self.elements.searchResults.innerHTML = '';
            var li = document.createElement('li');
            li.textContent = 'Search failed. Please try again.';
            li.className = 'wpkko-no-results';
            self.elements.searchResults.appendChild(li);
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

    EPUBReader.prototype.loadProgressAsync = function () {
        var self = this;

        if (wpkkoEpub.nonce) {
            var url = wpkkoEpub.ajaxUrl + '?action=wpkko_load_progress&nonce=' +
                      encodeURIComponent(wpkkoEpub.nonce) + '&book_id=' +
                      encodeURIComponent(this.bookId);

            return fetch(url, { credentials: 'same-origin' })
                .then(function (r) { return r.json(); })
                .then(function (resp) {
                    if (resp.success && resp.data) {
                        return resp.data;
                    }
                    return self.loadProgressFromStorage();
                })
                .catch(function () {
                    return self.loadProgressFromStorage();
                });
        }

        return Promise.resolve(this.loadProgressFromStorage());
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
