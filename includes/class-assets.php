<?php
/**
 * Enqueue scripts and styles.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WPKko_EPUB_Assets {

    private static $instance  = null;
    private static $enqueued  = false;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_assets' ) );
    }

    /**
     * Enqueue front-end assets (called on demand).
     */
    public static function enqueue_frontend() {
        if ( self::$enqueued ) {
            return;
        }
        self::$enqueued = true;

        // epub.js from jsDelivr CDN (includes JSZip internally).
        wp_enqueue_script(
            'epubjs',
            'https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js',
            array(),
            '0.3.93',
            true
        );

        // Plugin reader script.
        wp_enqueue_script(
            'wpkko-epub-reader',
            WPKKO_EPUB_PLUGIN_URL . 'assets/js/reader.js',
            array( 'epubjs' ),
            WPKKO_EPUB_VERSION,
            true
        );

        wp_localize_script( 'wpkko-epub-reader', 'wpkkoEpub', array(
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( 'wpkko_epub_nonce' ),
            'i18n'    => array(
                'loading'        => __( 'Loading book...', 'wp-kko-epub-viewer' ),
                'error'          => __( 'Failed to load EPUB file.', 'wp-kko-epub-viewer' ),
                'noResults'      => __( 'No results found.', 'wp-kko-epub-viewer' ),
                'bookmarkAdded'  => __( 'Bookmark added!', 'wp-kko-epub-viewer' ),
                'bookmarkExists' => __( 'Already bookmarked.', 'wp-kko-epub-viewer' ),
                'page'           => __( 'Page', 'wp-kko-epub-viewer' ),
                'of'             => __( 'of', 'wp-kko-epub-viewer' ),
            ),
        ) );

        // Plugin CSS.
        wp_enqueue_style(
            'wpkko-epub-skins',
            WPKKO_EPUB_PLUGIN_URL . 'assets/css/skins.css',
            array(),
            WPKKO_EPUB_VERSION
        );

        wp_enqueue_style(
            'wpkko-epub-reader',
            WPKKO_EPUB_PLUGIN_URL . 'assets/css/reader.css',
            array( 'wpkko-epub-skins' ),
            WPKKO_EPUB_VERSION
        );
    }

    /**
     * Admin assets for the settings page.
     */
    public function admin_assets( $hook ) {
        if ( 'settings_page_wpkko-epub-viewer' !== $hook ) {
            return;
        }
        wp_enqueue_style(
            'wpkko-epub-admin',
            WPKKO_EPUB_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            WPKKO_EPUB_VERSION
        );
    }
}
