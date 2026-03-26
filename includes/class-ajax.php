<?php
/**
 * AJAX handlers for bookmark save/load.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WPKko_EPUB_Ajax {

    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Logged-in users.
        add_action( 'wp_ajax_wpkko_save_bookmarks', array( $this, 'save_bookmarks' ) );
        add_action( 'wp_ajax_wpkko_load_bookmarks', array( $this, 'load_bookmarks' ) );
        add_action( 'wp_ajax_wpkko_save_progress', array( $this, 'save_progress' ) );
        add_action( 'wp_ajax_wpkko_load_progress', array( $this, 'load_progress' ) );
    }

    /**
     * Save bookmarks for a specific EPUB.
     */
    public function save_bookmarks() {
        check_ajax_referer( 'wpkko_epub_nonce', 'nonce' );

        $book_id   = sanitize_text_field( wp_unslash( $_POST['book_id'] ?? '' ) );
        $bookmarks = sanitize_text_field( wp_unslash( $_POST['bookmarks'] ?? '[]' ) );

        if ( empty( $book_id ) ) {
            wp_send_json_error( 'Missing book ID.' );
        }

        $user_id = get_current_user_id();
        $meta_key = 'wpkko_epub_bookmarks_' . md5( $book_id );
        update_user_meta( $user_id, $meta_key, $bookmarks );

        wp_send_json_success();
    }

    /**
     * Load bookmarks for a specific EPUB.
     */
    public function load_bookmarks() {
        check_ajax_referer( 'wpkko_epub_nonce', 'nonce' );

        $book_id = sanitize_text_field( wp_unslash( $_GET['book_id'] ?? '' ) );

        if ( empty( $book_id ) ) {
            wp_send_json_error( 'Missing book ID.' );
        }

        $user_id  = get_current_user_id();
        $meta_key = 'wpkko_epub_bookmarks_' . md5( $book_id );
        $data     = get_user_meta( $user_id, $meta_key, true );

        wp_send_json_success( $data ? $data : '[]' );
    }

    /**
     * Save reading progress (last location) for a specific EPUB.
     */
    public function save_progress() {
        check_ajax_referer( 'wpkko_epub_nonce', 'nonce' );

        $book_id  = sanitize_text_field( wp_unslash( $_POST['book_id'] ?? '' ) );
        $location = sanitize_text_field( wp_unslash( $_POST['location'] ?? '' ) );

        if ( empty( $book_id ) ) {
            wp_send_json_error( 'Missing book ID.' );
        }

        $user_id  = get_current_user_id();
        $meta_key = 'wpkko_epub_progress_' . md5( $book_id );
        update_user_meta( $user_id, $meta_key, $location );

        wp_send_json_success();
    }

    /**
     * Load reading progress for a specific EPUB.
     */
    public function load_progress() {
        check_ajax_referer( 'wpkko_epub_nonce', 'nonce' );

        $book_id = sanitize_text_field( wp_unslash( $_GET['book_id'] ?? '' ) );

        if ( empty( $book_id ) ) {
            wp_send_json_error( 'Missing book ID.' );
        }

        $user_id  = get_current_user_id();
        $meta_key = 'wpkko_epub_progress_' . md5( $book_id );
        $data     = get_user_meta( $user_id, $meta_key, true );

        wp_send_json_success( $data ? $data : '' );
    }
}
