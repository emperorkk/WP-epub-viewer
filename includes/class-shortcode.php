<?php
/**
 * [epub_viewer] shortcode for classic editor and general use.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WPKko_EPUB_Shortcode {

    private static $instance = null;
    private static $counter  = 0;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_shortcode( 'epub_viewer', array( $this, 'render' ) );
    }

    /**
     * Render the EPUB viewer.
     */
    public function render( $atts ) {
        // Check login requirement.
        $require_login = WPKko_EPUB_Settings::get( 'require_login', false );
        if ( $require_login && ! is_user_logged_in() ) {
            return '<p class="wpkko-epub-login-notice">' .
                   esc_html__( 'Please log in to view this content.', 'superior-e-pub-viewer' ) .
                   '</p>';
        }

        $defaults = array(
            'src'    => '',
            'skin'   => WPKko_EPUB_Settings::get( 'default_skin', 'ocean-breeze' ),
            'width'  => '100%',
            'height' => '600px',
        );

        $atts = shortcode_atts( $defaults, $atts, 'epub_viewer' );

        // Resolve src: could be numeric attachment ID or URL.
        $src = $atts['src'];
        if ( is_numeric( $src ) ) {
            $src = wp_get_attachment_url( (int) $src );
        }

        if ( empty( $src ) ) {
            return '<p class="wpkko-epub-error">' .
                   esc_html__( 'No EPUB source provided.', 'superior-e-pub-viewer' ) .
                   '</p>';
        }

        // Validate skin.
        $skins = WPKko_EPUB_Settings::get_skins();
        $skin  = array_key_exists( $atts['skin'], $skins ) ? $atts['skin'] : 'ocean-breeze';

        self::$counter++;
        $id = 'wpkko-epub-' . self::$counter;

        // Enqueue front-end assets.
        WPKko_EPUB_Assets::enqueue_frontend();

        $width  = esc_attr( $atts['width'] );
        $height = esc_attr( $atts['height'] );

        ob_start();
        ?>
        <div id="<?php echo esc_attr( $id ); ?>"
             class="wpkko-epub-viewer wpkko-skin-<?php echo esc_attr( $skin ); ?>"
             data-epub-src="<?php echo esc_url( $src ); ?>"
             data-epub-skin="<?php echo esc_attr( $skin ); ?>"
             style="width:<?php echo esc_attr( $width ); ?>;height:<?php echo esc_attr( $height ); ?>;">

            <!-- Toolbar -->
            <div class="wpkko-toolbar">
                <button class="wpkko-btn wpkko-btn-toc" title="<?php esc_attr_e( 'Table of Contents', 'superior-e-pub-viewer' ); ?>">
                    <span class="wpkko-icon">&#9776;</span>
                </button>
                <button class="wpkko-btn wpkko-btn-prev" title="<?php esc_attr_e( 'Previous Page', 'superior-e-pub-viewer' ); ?>">
                    <span class="wpkko-icon">&#9664;</span>
                </button>
                <span class="wpkko-page-info"></span>
                <button class="wpkko-btn wpkko-btn-next" title="<?php esc_attr_e( 'Next Page', 'superior-e-pub-viewer' ); ?>">
                    <span class="wpkko-icon">&#9654;</span>
                </button>
                <button class="wpkko-btn wpkko-btn-font-down" title="<?php esc_attr_e( 'Decrease Font Size', 'superior-e-pub-viewer' ); ?>">
                    <span class="wpkko-icon">A-</span>
                </button>
                <button class="wpkko-btn wpkko-btn-font-up" title="<?php esc_attr_e( 'Increase Font Size', 'superior-e-pub-viewer' ); ?>">
                    <span class="wpkko-icon">A+</span>
                </button>
                <button class="wpkko-btn wpkko-btn-bookmark" title="<?php esc_attr_e( 'Bookmark', 'superior-e-pub-viewer' ); ?>">
                    <span class="wpkko-icon">&#9733;</span>
                </button>
                <button class="wpkko-btn wpkko-btn-search" title="<?php esc_attr_e( 'Search', 'superior-e-pub-viewer' ); ?>">
                    <span class="wpkko-icon">&#128269;</span>
                </button>
                <button class="wpkko-btn wpkko-btn-text-color" title="<?php esc_attr_e( 'Cycle Text Color', 'superior-e-pub-viewer' ); ?>">
                    <span class="wpkko-icon">&#x1D00;</span>
                </button>
                <button class="wpkko-btn wpkko-btn-fullscreen" title="<?php esc_attr_e( 'Fullscreen', 'superior-e-pub-viewer' ); ?>">
                    <span class="wpkko-icon">&#x26F6;</span>
                </button>
                <select class="wpkko-skin-switcher" title="<?php esc_attr_e( 'Change Skin', 'superior-e-pub-viewer' ); ?>">
                    <?php foreach ( $skins as $slug => $label ) : ?>
                        <option value="<?php echo esc_attr( $slug ); ?>" <?php selected( $skin, $slug ); ?>>
                            <?php echo esc_html( $label ); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- TOC Sidebar -->
            <div class="wpkko-toc-sidebar" style="display:none;">
                <div class="wpkko-toc-header">
                    <strong><?php esc_html_e( 'Table of Contents', 'superior-e-pub-viewer' ); ?></strong>
                    <button class="wpkko-btn wpkko-btn-toc-close">&times;</button>
                </div>
                <ul class="wpkko-toc-list"></ul>
            </div>

            <!-- Search Panel -->
            <div class="wpkko-search-panel" style="display:none;">
                <div class="wpkko-search-header">
                    <input type="text" class="wpkko-search-input" placeholder="<?php esc_attr_e( 'Search...', 'superior-e-pub-viewer' ); ?>">
                    <button class="wpkko-btn wpkko-btn-search-go" title="<?php esc_attr_e( 'Search', 'superior-e-pub-viewer' ); ?>">&#128269;</button>
                    <button class="wpkko-btn wpkko-btn-search-close">&times;</button>
                </div>
                <ul class="wpkko-search-results"></ul>
            </div>

            <!-- Bookmarks Panel -->
            <div class="wpkko-bookmarks-panel" style="display:none;">
                <div class="wpkko-bookmarks-header">
                    <strong><?php esc_html_e( 'Bookmarks', 'superior-e-pub-viewer' ); ?></strong>
                    <button class="wpkko-btn wpkko-btn-bookmarks-close">&times;</button>
                </div>
                <ul class="wpkko-bookmarks-list"></ul>
            </div>

            <!-- Reader area -->
            <div class="wpkko-reader-area"></div>

            <!-- Loading spinner -->
            <div class="wpkko-loading">
                <div class="wpkko-spinner"></div>
                <p><?php esc_html_e( 'Loading book...', 'superior-e-pub-viewer' ); ?></p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}
