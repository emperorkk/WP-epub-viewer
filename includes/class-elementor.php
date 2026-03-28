<?php
/**
 * Elementor integration — registers the EPUB Viewer widget.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WPKko_EPUB_Elementor {

    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'elementor/widgets/register', array( $this, 'register_widget' ) );
        add_action( 'elementor/elements/categories_registered', array( $this, 'add_category' ) );
    }

    public function add_category( $elements_manager ) {
        $elements_manager->add_category( 'wpkko-epub', array(
            'title' => __( 'EPUB Viewer', 'wp-kko-epub-viewer' ),
            'icon'  => 'eicon-document-file',
        ) );
    }

    public function register_widget( $widgets_manager ) {
        require_once WPKKO_EPUB_PLUGIN_DIR . 'elementor/class-widget-epub-viewer.php';
        $widgets_manager->register( new WPKko_Elementor_EPUB_Widget() );
    }
}
