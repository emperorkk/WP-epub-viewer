=== Superior e-Pub Viewer ===
Contributors: emperorkk
Tags: epub, ebook, reader, viewer, book
Requires at least: 5.8
Tested up to: 6.9.4
Stable tag: 2.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed a full-featured EPUB reader in WordPress with 10 skins, TOC, search, bookmarks, and more.

== Description ==

Superior e-Pub Viewer lets you embed EPUB ebooks directly into your WordPress posts and pages with a polished, interactive reader interface. No external services, no API keys, no subscriptions -- everything runs self-hosted in the browser.

Works with the **Gutenberg block editor**, **Elementor**, and the **classic editor** (via shortcode).

= Features =

* **EPUB rendering** powered by [epub.js](https://github.com/futurepress/epub.js) (MIT)
* **Gutenberg block** -- drag-and-drop EPUB viewer in the block editor
* **Elementor widget** -- dedicated widget in the Elementor page builder
* **Classic editor shortcode** -- `[epub_viewer]` for any context
* **10 CSS skins** -- switch themes on the fly
* **Table of Contents** sidebar with smart heading-match navigation
* **Page-by-page navigation** with arrow keys and swipe
* **Font size adjustment** (A+ / A-) that scales all text proportionally
* **Bookmarking** with persistent storage (AJAX for logged-in users, localStorage fallback)
* **Reading progress** -- automatically resumes where you left off
* **Full-text search** with CFI-based precision navigation
* **Text color cycling** -- Auto, White, Black, Teal, Red, Green
* **Fullscreen mode**
* **Multiple viewers per page**
* **Access control** -- optionally restrict to logged-in users
* **Media Library integration** -- upload EPUBs directly or use external URLs
* **Responsive** -- works on desktop, tablet, and mobile

== Installation ==

1. Download or clone this repository into `wp-content/plugins/superior-e-pub-viewer/`
2. Activate the plugin from **Plugins > Installed Plugins**
3. Configure default settings at **Settings > EPUB Viewer**

== Quick Start ==

= Shortcode (Classic Editor) =

`[epub_viewer src="https://example.com/book.epub" skin="ocean-breeze" width="100%" height="600px"]`

Or use a Media Library attachment ID:

`[epub_viewer src="123" skin="royal-gold"]`

= Gutenberg Block =

1. Add a new block and search for **EPUB Viewer**
2. Upload an EPUB file or paste a URL in the sidebar settings
3. Choose a skin, width, and height

= Elementor Widget =

1. In the Elementor editor, find **EPUB Viewer** under the EPUB Viewer category
2. Choose source type: Media Library upload or external URL
3. Configure skin and height in the widget controls

== Available Skins ==

| Skin | Colors |
|------|--------|
| Ocean Breeze | Teal & Blue |
| Royal Gold | Gold & Black |
| Berry Bloom | Pink & Purple |
| Midnight | Dark Navy & Silver |
| Forest | Dark Green & Cream |
| Sunset | Orange & Dark Red |
| Arctic | White & Ice Blue |
| Charcoal | Dark Gray & Amber |
| Lavender Dream | Lavender & Soft White |
| Classic | Black & White |

== Requirements ==

* WordPress 5.8+
* PHP 7.4+
* Elementor (optional, for the Elementor widget)

== Third-Party Libraries ==

This plugin bundles the following open-source libraries:

* **epub.js v0.3.93** (patched) -- MIT License -- [github.com/futurepress/epub.js](https://github.com/futurepress/epub.js)
* **JSZip v3.10.1** -- MIT License -- [github.com/Stuk/jszip](https://github.com/Stuk/jszip)

Both are self-hosted in `assets/js/vendor/` with no external CDN calls.

== Changelog ==

= 2.0.0 =
* **Major rename:** Plugin is now "Superior e-Pub Viewer" (internal prefixes unchanged)
* **Self-hosted dependencies:** JSZip bundled locally -- no external CDN calls
* **Font size controls:** em-based scaling that preserves heading hierarchy across all skins
* **Search:** CFI-based precision navigation for exact match positioning
* **TOC navigation:** heading-match fallback for single-spine EPUBs without fragment IDs
* **Search panel:** proper text colors on all dark skins
* **Security:** fixed output escaping for width/height attributes
* **Compatibility:** removed deprecated `load_plugin_textdomain` call (handled by WP core since 4.6)
* **Attributions:** full MIT license texts for epub.js and JSZip in `assets/js/vendor/LICENSES.md`
* Tested up to WordPress 6.9.4

= 1.0.0 =
* Initial release

== License ==

GPLv2 or later
