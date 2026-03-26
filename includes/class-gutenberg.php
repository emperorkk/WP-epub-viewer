<?php
/**
 * Gutenberg block registration.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WPKko_EPUB_Gutenberg {

    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'init', array( $this, 'register_block' ) );
    }

    public function register_block() {
        if ( ! function_exists( 'register_block_type' ) ) {
            return;
        }

        wp_register_script(
            'wpkko-epub-block-editor',
            WPKKO_EPUB_PLUGIN_URL . 'blocks/epub-viewer/index.js',
            array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n', 'wp-block-editor' ),
            WPKKO_EPUB_VERSION,
            true
        );

        wp_localize_script( 'wpkko-epub-block-editor', 'wpkkoEpubBlock', array(
            'skins' => WPKko_EPUB_Settings::get_skins(),
        ) );

        wp_register_style(
            'wpkko-epub-block-editor-style',
            WPKKO_EPUB_PLUGIN_URL . 'blocks/epub-viewer/editor.css',
            array(),
            WPKKO_EPUB_VERSION
        );

        register_block_type( 'wpkko/epub-viewer', array(
            'editor_script'   => 'wpkko-epub-block-editor',
            'editor_style'    => 'wpkko-epub-block-editor-style',
            'render_callback' => array( $this, 'render_block' ),
            'attributes'      => array(
                'src' => array(
                    'type'    => 'string',
                    'default' => '',
                ),
                'mediaId' => array(
                    'type'    => 'number',
                    'default' => 0,
                ),
                'skin' => array(
                    'type'    => 'string',
                    'default' => 'ocean-breeze',
                ),
                'width' => array(
                    'type'    => 'string',
                    'default' => '100%',
                ),
                'height' => array(
                    'type'    => 'string',
                    'default' => '600px',
                ),
            ),
        ) );
    }

    /**
     * Server-side render for the Gutenberg block — delegates to shortcode.
     */
    public function render_block( $attributes ) {
        $src = '';
        if ( ! empty( $attributes['mediaId'] ) ) {
            $src = $attributes['mediaId'];
        } elseif ( ! empty( $attributes['src'] ) ) {
            $src = $attributes['src'];
        }

        $shortcode = sprintf(
            '[epub_viewer src="%s" skin="%s" width="%s" height="%s"]',
            esc_attr( $src ),
            esc_attr( $attributes['skin'] ),
            esc_attr( $attributes['width'] ),
            esc_attr( $attributes['height'] )
        );

        return do_shortcode( $shortcode );
    }
}
