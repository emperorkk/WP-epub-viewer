# WP-kko EPUB Viewer

A full-featured WordPress plugin for viewing EPUB ebooks directly in the browser. Works with the **Gutenberg block editor**, **Elementor**, and the **classic editor** (via shortcode).

## Features

- **EPUB rendering** powered by [epub.js](https://github.com/futurepress/epub.js) (MIT)
- **Gutenberg block** — drag-and-drop EPUB viewer in the block editor
- **Elementor widget** — dedicated widget in the Elementor page builder
- **Classic editor shortcode** — `[epub_viewer]` for any context
- **10 CSS skins** — switch themes on the fly
- **Table of Contents** sidebar
- **Page-by-page navigation** with arrow keys and swipe
- **Font size adjustment** (A+ / A-)
- **Bookmarking** with persistent storage (AJAX for logged-in users, localStorage fallback)
- **Reading progress** — automatically resumes where you left off
- **Full-text search** within the book
- **Fullscreen mode**
- **Multiple viewers per page**
- **Access control** — optionally restrict to logged-in users
- **Media Library integration** — upload EPUBs directly or use external URLs
- **Responsive** — works on desktop, tablet, and mobile
- **PHP 7.4+** compatible

## Installation

1. Download or clone this repository into `wp-content/plugins/wp-kko-epub-viewer/`
2. Activate the plugin from **Plugins → Installed Plugins**
3. Configure default settings at **Settings → EPUB Viewer**

## Quick Start

### Shortcode (Classic Editor)

```
[epub_viewer src="https://example.com/book.epub" skin="ocean-breeze" width="100%" height="600px"]
```

Or use a Media Library attachment ID:

```
[epub_viewer src="123" skin="royal-gold"]
```

### Gutenberg Block

1. Add a new block and search for **EPUB Viewer**
2. Upload an EPUB file or paste a URL in the sidebar settings
3. Choose a skin, width, and height

### Elementor Widget

1. In the Elementor editor, find **EPUB Viewer** under the EPUB Viewer category
2. Choose source type: Media Library upload or external URL
3. Configure skin and height in the widget controls

## Available Skins

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

## Requirements

- WordPress 5.8+
- PHP 7.4+
- Elementor (optional, for the Elementor widget)

## License

GPL-2.0-or-later
