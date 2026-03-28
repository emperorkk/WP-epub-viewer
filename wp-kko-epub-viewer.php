<?php
/**
 * Plugin Name: WP-kko EPUB Viewer
 * Plugin URI:  https://github.com/emperorkk/wp-epub-viewer
 * Description: A full-featured EPUB reader for WordPress with Gutenberg block, Elementor widget, and classic editor shortcode support. Includes 10 CSS skins, TOC, bookmarking, search, fullscreen, and more.
 * Version:     1.2.1
 * Author:      emperorkk
 * Author URI:  https://github.com/emperorkk
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wp-kko-epub-viewer
 * Domain Path: /languages
 * Requires PHP: 7.4
 * Requires at least: 5.8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'WPKKO_EPUB_VERSION', '1.2.1' );
define( 'WPKKO_EPUB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WPKKO_EPUB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WPKKO_EPUB_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Main plugin class.
 */
final class WPKko_EPUB_Viewer {

    /** @var self|null */
    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->load_dependencies();
        $this->init_hooks();
    }

    private function load_dependencies() {
        require_once WPKKO_EPUB_PLUGIN_DIR . 'includes/class-settings.php';
        require_once WPKKO_EPUB_PLUGIN_DIR . 'includes/class-shortcode.php';
        require_once WPKKO_EPUB_PLUGIN_DIR . 'includes/class-assets.php';
        require_once WPKKO_EPUB_PLUGIN_DIR . 'includes/class-gutenberg.php';
        require_once WPKKO_EPUB_PLUGIN_DIR . 'includes/class-ajax.php';

        if ( did_action( 'elementor/loaded' ) ) {
            require_once WPKKO_EPUB_PLUGIN_DIR . 'includes/class-elementor.php';
        } else {
            add_action( 'elementor/loaded', function () {
                require_once WPKKO_EPUB_PLUGIN_DIR . 'includes/class-elementor.php';
                WPKko_EPUB_Elementor::instance();
            } );
        }
    }

    private function init_hooks() {
        add_action( 'init', array( $this, 'load_textdomain' ) );
        add_filter( 'upload_mimes', array( $this, 'allow_epub_upload' ) );
        add_filter( 'wp_check_filetype_and_ext', array( $this, 'fix_epub_filetype' ), 10, 5 );

        WPKko_EPUB_Settings::instance();
        WPKko_EPUB_Shortcode::instance();
        WPKko_EPUB_Assets::instance();
        WPKko_EPUB_Gutenberg::instance();
        WPKko_EPUB_Ajax::instance();
    }

    public function load_textdomain() {
        load_plugin_textdomain(
            'wp-kko-epub-viewer',
            false,
            dirname( WPKKO_EPUB_PLUGIN_BASENAME ) . '/languages'
        );
    }

    /**
     * Allow EPUB file uploads in the Media Library.
     */
    public function allow_epub_upload( $mimes ) {
        $mimes['epub'] = 'application/epub+zip';
        return $mimes;
    }

    /**
     * Fix EPUB MIME type detection on some server configs.
     */
    public function fix_epub_filetype( $data, $file, $filename, $mimes, $real_mime = '' ) {
        if ( ! empty( $data['ext'] ) && ! empty( $data['type'] ) ) {
            return $data;
        }

        $filetype = wp_check_filetype( $filename, $mimes );

        if ( 'epub' === $filetype['ext'] ) {
            $data['ext']  = 'epub';
            $data['type'] = 'application/epub+zip';
            $data['proper_filename'] = $filename;
        }

        return $data;
    }
}

/**
 * Activation hook — flush rewrite rules.
 */
function wpkko_epub_activate() {
    add_option( 'wpkko_epub_settings', array(
        'require_login' => false,
        'default_skin'  => 'ocean-breeze',
    ) );
}
register_activation_hook( __FILE__, 'wpkko_epub_activate' );

/**
 * Boot the plugin.
 */
function wpkko_epub_viewer() {
    return WPKko_EPUB_Viewer::instance();
}
add_action( 'plugins_loaded', 'wpkko_epub_viewer' );
