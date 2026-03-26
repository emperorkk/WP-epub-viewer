<?php
/**
 * Elementor EPUB Viewer widget.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WPKko_Elementor_EPUB_Widget extends \Elementor\Widget_Base {

    public function get_name() {
        return 'wpkko_epub_viewer';
    }

    public function get_title() {
        return __( 'EPUB Viewer', 'wp-kko-epub-viewer' );
    }

    public function get_icon() {
        return 'eicon-document-file';
    }

    public function get_categories() {
        return array( 'wpkko-epub' );
    }

    public function get_keywords() {
        return array( 'epub', 'ebook', 'reader', 'book', 'viewer' );
    }

    protected function register_controls() {

        // --- Content Tab ---
        $this->start_controls_section( 'section_content', array(
            'label' => __( 'EPUB Source', 'wp-kko-epub-viewer' ),
            'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
        ) );

        $this->add_control( 'source_type', array(
            'label'   => __( 'Source Type', 'wp-kko-epub-viewer' ),
            'type'    => \Elementor\Controls_Manager::SELECT,
            'default' => 'upload',
            'options' => array(
                'upload' => __( 'Media Library', 'wp-kko-epub-viewer' ),
                'url'    => __( 'External URL', 'wp-kko-epub-viewer' ),
            ),
        ) );

        $this->add_control( 'epub_file', array(
            'label'      => __( 'Upload EPUB', 'wp-kko-epub-viewer' ),
            'type'       => \Elementor\Controls_Manager::MEDIA,
            'media_types' => array( 'application/epub+zip', 'application/octet-stream' ),
            'condition'  => array( 'source_type' => 'upload' ),
        ) );

        $this->add_control( 'epub_url', array(
            'label'       => __( 'EPUB URL', 'wp-kko-epub-viewer' ),
            'type'        => \Elementor\Controls_Manager::URL,
            'placeholder' => 'https://example.com/book.epub',
            'condition'   => array( 'source_type' => 'url' ),
        ) );

        $this->end_controls_section();

        // --- Appearance Tab ---
        $this->start_controls_section( 'section_appearance', array(
            'label' => __( 'Appearance', 'wp-kko-epub-viewer' ),
            'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
        ) );

        $skin_options = WPKko_EPUB_Settings::get_skins();

        $this->add_control( 'skin', array(
            'label'   => __( 'Skin', 'wp-kko-epub-viewer' ),
            'type'    => \Elementor\Controls_Manager::SELECT,
            'default' => WPKko_EPUB_Settings::get( 'default_skin', 'ocean-breeze' ),
            'options' => $skin_options,
        ) );

        $this->add_responsive_control( 'viewer_height', array(
            'label'      => __( 'Height', 'wp-kko-epub-viewer' ),
            'type'       => \Elementor\Controls_Manager::SLIDER,
            'size_units' => array( 'px', 'vh' ),
            'range'      => array(
                'px' => array( 'min' => 300, 'max' => 1200, 'step' => 10 ),
                'vh' => array( 'min' => 30, 'max' => 100, 'step' => 5 ),
            ),
            'default'    => array( 'size' => 600, 'unit' => 'px' ),
        ) );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();

        $src = '';
        if ( 'upload' === $settings['source_type'] && ! empty( $settings['epub_file']['url'] ) ) {
            $src = $settings['epub_file']['url'];
        } elseif ( 'url' === $settings['source_type'] && ! empty( $settings['epub_url']['url'] ) ) {
            $src = $settings['epub_url']['url'];
        }

        $skin   = ! empty( $settings['skin'] ) ? $settings['skin'] : 'ocean-breeze';
        $height = '600px';
        if ( ! empty( $settings['viewer_height']['size'] ) ) {
            $height = $settings['viewer_height']['size'] . $settings['viewer_height']['unit'];
        }

        echo do_shortcode( sprintf(
            '[epub_viewer src="%s" skin="%s" width="100%%" height="%s"]',
            esc_attr( $src ),
            esc_attr( $skin ),
            esc_attr( $height )
        ) );
    }
}
