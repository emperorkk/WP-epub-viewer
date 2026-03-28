# WP-kko EPUB Viewer — Full Documentation

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage — Shortcode](#usage--shortcode)
5. [Usage — Gutenberg Block](#usage--gutenberg-block)
6. [Usage — Elementor Widget](#usage--elementor-widget)
7. [Skins Reference](#skins-reference)
8. [Reader Features](#reader-features)
9. [Access Control](#access-control)
10. [Bookmarks & Progress](#bookmarks--progress)
11. [Multiple Viewers Per Page](#multiple-viewers-per-page)
12. [Developer Notes](#developer-notes)
13. [Troubleshooting](#troubleshooting)
14. [File Structure](#file-structure)

---

## Overview

WP-kko EPUB Viewer is a WordPress plugin that embeds a full-featured EPUB reader anywhere on your site. It supports three integration methods:

- **Gutenberg block** for the modern WordPress editor
- **Elementor widget** for Elementor page builder users
- **Shortcode** for the classic editor or any widget/template

The reader is powered by [epub.js](https://github.com/futurepress/epub.js), a well-maintained MIT-licensed JavaScript library for rendering EPUB files in the browser.

---

## Installation

### From GitHub

1. Clone or download this repository
2. Copy the entire folder to `wp-content/plugins/wp-kko-epub-viewer/`
3. Go to **WordPress Admin → Plugins → Installed Plugins**
4. Click **Activate** next to "WP-kko EPUB Viewer"

### From ZIP

1. Go to **Plugins → Add New → Upload Plugin**
2. Select the ZIP file and click **Install Now**
3. Activate the plugin

### Post-Installation

After activation, visit **Settings → EPUB Viewer** to configure defaults.

---

## Configuration

Navigate to **Settings → EPUB Viewer** in the WordPress admin.

### Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Require Login** | When checked, EPUB viewers are only visible to logged-in users. Non-logged-in visitors see a "Please log in" message. | Unchecked |
| **Default Skin** | The skin used when no `skin` attribute is specified in the shortcode/block. | Ocean Breeze |

---

## Usage — Shortcode

The shortcode `[epub_viewer]` works in the classic editor, widgets, and PHP templates.

### Syntax

```
[epub_viewer src="SOURCE" skin="SKIN_SLUG" width="WIDTH" height="HEIGHT"]
```

### Parameters

| Parameter | Required | Description | Default |
|-----------|----------|-------------|---------|
| `src` | **Yes** | EPUB source — either a full URL (`https://...`) or a WordPress Media Library attachment ID (numeric). | — |
| `skin` | No | Skin slug from the table below. | Value from Settings |
| `width` | No | CSS width of the viewer container. | `100%` |
| `height` | No | CSS height of the viewer container. | `600px` |

### Examples

**External URL:**
```
[epub_viewer src="https://example.com/books/my-ebook.epub"]
```

**Media Library (attachment ID 42):**
```
[epub_viewer src="42" skin="midnight" height="700px"]
```

**Custom dimensions:**
```
[epub_viewer src="https://example.com/book.epub" width="800px" height="500px" skin="royal-gold"]
```

### Using in PHP templates

```php
<?php echo do_shortcode('[epub_viewer src="42" skin="forest"]'); ?>
```

---

## Usage — Gutenberg Block

1. In the **block editor**, click the "+" button or type `/epub`
2. Select **EPUB Viewer** from the block list (under the "Embed" category)
3. Click **Upload EPUB** to choose a file from the Media Library
4. Alternatively, enter an external URL in the block sidebar settings

### Block Sidebar Settings

- **Skin** — dropdown with all 10 available skins
- **Width** — CSS width (default `100%`)
- **Height** — CSS height (default `600px`)
- **External URL** — paste a direct link to an `.epub` file

The block renders server-side, so the live reader appears on the front-end, not in the editor.

---

## Usage — Elementor Widget

### Prerequisites

Elementor plugin must be installed and activated.

### Steps

1. Open a page/post in the **Elementor editor**
2. In the widget panel, find **EPUB Viewer** (under the "EPUB Viewer" category)
3. Drag the widget into your layout

### Widget Controls

**Content Tab — EPUB Source:**

| Control | Description |
|---------|-------------|
| Source Type | Choose "Media Library" to upload, or "External URL" to paste a link |
| Upload EPUB | Media Library file picker (shown when Source Type = Media Library) |
| EPUB URL | URL input field (shown when Source Type = External URL) |

**Content Tab — Appearance:**

| Control | Description |
|---------|-------------|
| Skin | Dropdown with all 10 skins |
| Height | Responsive slider (px or vh) with min 300px and max 1200px |

---

## Skins Reference

All skins are pure CSS, using CSS custom properties for easy theming.

| Slug | Name | Primary Color | Secondary Color |
|------|------|---------------|-----------------|
| `ocean-breeze` | Ocean Breeze | Teal (#00838f) | Blue (#26c6da) |
| `royal-gold` | Royal Gold | Gold (#ffd700) | Black (#1a1a1a) |
| `berry-bloom` | Berry Bloom | Pink (#880e4f) | Purple (#e040fb) |
| `midnight` | Midnight | Dark Navy (#0d1b2a) | Silver (#90a4ae) |
| `forest` | Forest | Dark Green (#1b5e20) | Cream (#faf8f0) |
| `sunset` | Sunset | Orange (#ffab40) | Dark Red (#bf360c) |
| `arctic` | Arctic | White (#ffffff) | Ice Blue (#039be5) |
| `charcoal` | Charcoal | Dark Gray (#303030) | Amber (#ffc107) |
| `lavender-dream` | Lavender Dream | Lavender (#7b1fa2) | Soft White (#f3e5f5) |
| `classic` | Classic | Black (#222222) | White (#ffffff) |

### Switching Skins at Runtime

Each viewer includes a skin dropdown in the toolbar. Users can switch skins on the fly without reloading the page.

---

## Reader Features

### Navigation

- **Previous / Next buttons** in the toolbar
- **Left / Right arrow keys** when hovering over or focused on the viewer
- **Swipe left / right** on touch devices

### Table of Contents

- Click the **hamburger menu** (☰) button in the toolbar
- A sidebar panel slides in showing the book's TOC
- Click any chapter to navigate directly to it
- Nested chapters are supported

### Font Size

- **A-** button decreases font size (minimum 50%)
- **A+** button increases font size (maximum 200%)
- Changes are applied instantly via epub.js themes API

### Bookmarks

- **Single-click** the star (★) button to bookmark the current page
- **Double-click** the star button to open the bookmarks panel
- Bookmarks show the percentage position and timestamp
- Click any bookmark to navigate to it
- Delete bookmarks with the × button

### Search

- Click the **magnifying glass** button to open the search panel
- Type a query and press **Enter**
- Results show text excerpts with context
- Click a result to jump to that location

### Fullscreen

- Click the **fullscreen** button (⛶) to expand the viewer
- Press **Escape** to exit fullscreen
- The viewer fills the entire screen with all controls available

### Progress Saving

- Your reading position is **automatically saved** on every page turn
- When you return to the book, it resumes from your last position
- For logged-in users, progress is saved server-side via AJAX
- For guest users (when login not required), progress is saved in localStorage

---

## Access Control

Enable **Require Login** in **Settings → EPUB Viewer** to restrict all EPUB viewers to logged-in users only.

When enabled, non-authenticated visitors see:
> "Please log in to view this content."

This is a global setting that applies to all viewer instances (shortcode, Gutenberg, and Elementor).

---

## Bookmarks & Progress

### Storage Strategy

| User State | Bookmarks | Progress |
|------------|-----------|----------|
| Logged in | Saved to WordPress user meta (server-side) + localStorage | Saved to user meta + localStorage |
| Guest | localStorage only | localStorage only |

### Data Format

- **Bookmarks** are stored as JSON arrays with `cfi`, `label`, and `date` fields
- **Progress** is stored as an EPUB CFI (Canonical Fragment Identifier) string
- Server-side data is keyed by an MD5 hash of the book URL

### Clearing Data

- Users can delete individual bookmarks via the bookmarks panel
- Progress resets if the user clears their browser's localStorage
- Admins can delete user meta entries from the database if needed

---

## Multiple Viewers Per Page

You can place multiple EPUB viewers on the same page. Each instance is fully independent:

```
[epub_viewer src="https://example.com/book1.epub" skin="ocean-breeze"]

[epub_viewer src="https://example.com/book2.epub" skin="midnight"]

[epub_viewer src="42" skin="royal-gold" height="500px"]
```

Each viewer has its own:
- Navigation state
- Bookmarks
- Search
- Font size
- Skin selection
- Progress tracking

---

## Developer Notes

### Architecture

```
wp-kko-epub-viewer.php     → Main plugin bootstrap
includes/
  class-settings.php       → Admin settings page & skin registry
  class-shortcode.php      → [epub_viewer] shortcode renderer
  class-assets.php         → Script/style enqueue management
  class-gutenberg.php      → Gutenberg block registration
  class-elementor.php      → Elementor integration loader
  class-ajax.php           → AJAX handlers for bookmarks/progress
elementor/
  class-widget-epub-viewer.php → Elementor widget definition
blocks/epub-viewer/
  index.js                 → Gutenberg block editor script
  editor.css               → Block editor styles
assets/
  js/reader.js             → Front-end EPUB reader (epub.js wrapper)
  css/reader.css            → Core reader styles
  css/skins.css            → 10 skin theme definitions
  css/admin.css            → Admin settings page styles
```

### Dependencies

- **epub.js v0.3.93** — loaded from cdnjs CDN
- **JSZip v3.10.1** — loaded from cdnjs CDN (required by epub.js)
- No build tools required — plain JavaScript and CSS

### Hooks & Filters

The plugin uses standard WordPress patterns:

- `upload_mimes` filter — adds `epub` MIME type
- `wp_check_filetype_and_ext` filter — fixes EPUB detection
- All AJAX handlers use nonce verification
- Assets are enqueued on-demand (only when a viewer is on the page)

### Adding Custom Skins

To add a new skin:

1. Add the slug/label to `WPKko_EPUB_Settings::get_skins()` in `includes/class-settings.php`
2. Add CSS variables block in `assets/css/skins.css`:

```css
.wpkko-skin-your-skin {
    --wpkko-bg: #fff;
    --wpkko-toolbar-bg: #333;
    --wpkko-text: #fff;
    --wpkko-accent: #00bcd4;
    --wpkko-panel-bg: #f5f5f5;
    --wpkko-panel-text: #333;
    --wpkko-border: #ddd;
}
```

### CSS Custom Properties Reference

| Variable | Used For |
|----------|----------|
| `--wpkko-bg` | Main viewer background |
| `--wpkko-toolbar-bg` | Toolbar background |
| `--wpkko-text` | Toolbar text/icon color |
| `--wpkko-accent` | Accent color (spinner, highlights) |
| `--wpkko-panel-bg` | Side panel backgrounds (TOC, search, bookmarks) |
| `--wpkko-panel-text` | Side panel text color |
| `--wpkko-border` | Border colors throughout |

---

## Troubleshooting

### EPUB upload fails

Some server configurations block EPUB uploads because the MIME type isn't recognized. This plugin adds `application/epub+zip` to WordPress's allowed MIME types automatically. If uploads still fail:

1. Check that your server's PHP `upload_max_filesize` is large enough
2. Ensure your hosting provider doesn't block ZIP-based uploads at the server level

### EPUB doesn't render

- Verify the EPUB file is valid (test it in a desktop reader like Calibre)
- Check browser console for JavaScript errors
- Ensure no other plugins are conflicting with epub.js
- Some DRM-protected EPUBs cannot be rendered in the browser

### Skins not applying

- Clear any page caches (plugin cache, CDN, browser)
- Verify the CSS files are loading (check Network tab in browser DevTools)

### Bookmarks not persisting for logged-in users

- Ensure AJAX is working (check for `admin-ajax.php` errors in the console)
- Verify the nonce is valid (nonces expire after 24 hours)

### Elementor widget not showing

- Elementor must be activated **before** this plugin, or deactivate and reactivate this plugin after Elementor is active
- Clear Elementor's CSS cache from **Elementor → Tools → Regenerate CSS**
