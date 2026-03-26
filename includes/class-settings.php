<?php
/**
 * Admin settings page.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WPKko_EPUB_Settings {

    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'admin_menu', array( $this, 'add_menu' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_filter( 'plugin_action_links_' . WPKKO_EPUB_PLUGIN_BASENAME, array( $this, 'action_links' ) );
    }

    public function add_menu() {
        add_options_page(
            __( 'WP-kko EPUB Viewer', 'wp-kko-epub-viewer' ),
            __( 'EPUB Viewer', 'wp-kko-epub-viewer' ),
            'manage_options',
            'wpkko-epub-viewer',
            array( $this, 'render_page' )
        );
    }

    public function register_settings() {
        register_setting( 'wpkko_epub_group', 'wpkko_epub_settings', array(
            'type'              => 'array',
            'sanitize_callback' => array( $this, 'sanitize' ),
            'default'           => array(
                'require_login' => false,
                'default_skin'  => 'ocean-breeze',
            ),
        ) );

        add_settings_section(
            'wpkko_epub_general',
            __( 'General Settings', 'wp-kko-epub-viewer' ),
            '__return_false',
            'wpkko-epub-viewer'
        );

        add_settings_field(
            'require_login',
            __( 'Require Login', 'wp-kko-epub-viewer' ),
            array( $this, 'field_require_login' ),
            'wpkko-epub-viewer',
            'wpkko_epub_general'
        );

        add_settings_field(
            'default_skin',
            __( 'Default Skin', 'wp-kko-epub-viewer' ),
            array( $this, 'field_default_skin' ),
            'wpkko-epub-viewer',
            'wpkko_epub_general'
        );
    }

    public function sanitize( $input ) {
        $clean = array();
        $clean['require_login'] = ! empty( $input['require_login'] );
        $clean['default_skin']  = sanitize_text_field( $input['default_skin'] );

        $valid_skins = self::get_skins();
        if ( ! array_key_exists( $clean['default_skin'], $valid_skins ) ) {
            $clean['default_skin'] = 'ocean-breeze';
        }

        return $clean;
    }

    public function field_require_login() {
        $opts = get_option( 'wpkko_epub_settings', array() );
        $val  = ! empty( $opts['require_login'] );
        ?>
        <label>
            <input type="checkbox" name="wpkko_epub_settings[require_login]" value="1" <?php checked( $val ); ?>>
            <?php esc_html_e( 'Only show EPUB viewers to logged-in users', 'wp-kko-epub-viewer' ); ?>
        </label>
        <?php
    }

    public function field_default_skin() {
        $opts    = get_option( 'wpkko_epub_settings', array() );
        $current = isset( $opts['default_skin'] ) ? $opts['default_skin'] : 'ocean-breeze';
        $skins   = self::get_skins();
        ?>
        <select name="wpkko_epub_settings[default_skin]">
            <?php foreach ( $skins as $slug => $label ) : ?>
                <option value="<?php echo esc_attr( $slug ); ?>" <?php selected( $current, $slug ); ?>>
                    <?php echo esc_html( $label ); ?>
                </option>
            <?php endforeach; ?>
        </select>
        <?php
    }

    public function render_page() {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'WP-kko EPUB Viewer Settings', 'wp-kko-epub-viewer' ); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields( 'wpkko_epub_group' );
                do_settings_sections( 'wpkko-epub-viewer' );
                submit_button();
                ?>
            </form>

            <hr>
            <h2><?php esc_html_e( 'Shortcode Usage', 'wp-kko-epub-viewer' ); ?></h2>
            <p><code>[epub_viewer src="URL_OR_MEDIA_ID" skin="ocean-breeze" width="100%" height="600px"]</code></p>
            <p><?php esc_html_e( 'Parameters:', 'wp-kko-epub-viewer' ); ?></p>
            <ul style="list-style:disc;margin-left:20px;">
                <li><strong>src</strong> — <?php esc_html_e( 'EPUB file URL or WordPress Media Library attachment ID', 'wp-kko-epub-viewer' ); ?></li>
                <li><strong>skin</strong> — <?php esc_html_e( 'Skin slug (see dropdown above for options)', 'wp-kko-epub-viewer' ); ?></li>
                <li><strong>width</strong> — <?php esc_html_e( 'Container width (default: 100%)', 'wp-kko-epub-viewer' ); ?></li>
                <li><strong>height</strong> — <?php esc_html_e( 'Container height (default: 600px)', 'wp-kko-epub-viewer' ); ?></li>
            </ul>
        </div>
        <?php
    }

    public function action_links( $links ) {
        $url  = admin_url( 'options-general.php?page=wpkko-epub-viewer' );
        $link = '<a href="' . esc_url( $url ) . '">' . esc_html__( 'Settings', 'wp-kko-epub-viewer' ) . '</a>';
        array_unshift( $links, $link );
        return $links;
    }

    /**
     * Available skins.
     */
    public static function get_skins() {
        return array(
            'ocean-breeze'    => __( 'Ocean Breeze (Teal & Blue)', 'wp-kko-epub-viewer' ),
            'royal-gold'      => __( 'Royal Gold (Gold & Black)', 'wp-kko-epub-viewer' ),
            'berry-bloom'     => __( 'Berry Bloom (Pink & Purple)', 'wp-kko-epub-viewer' ),
            'midnight'        => __( 'Midnight (Dark Navy & Silver)', 'wp-kko-epub-viewer' ),
            'forest'          => __( 'Forest (Dark Green & Cream)', 'wp-kko-epub-viewer' ),
            'sunset'          => __( 'Sunset (Orange & Dark Red)', 'wp-kko-epub-viewer' ),
            'arctic'          => __( 'Arctic (White & Ice Blue)', 'wp-kko-epub-viewer' ),
            'charcoal'        => __( 'Charcoal (Dark Gray & Amber)', 'wp-kko-epub-viewer' ),
            'lavender-dream'  => __( 'Lavender Dream (Lavender & Soft White)', 'wp-kko-epub-viewer' ),
            'classic'         => __( 'Classic (Black & White)', 'wp-kko-epub-viewer' ),
        );
    }

    /**
     * Get a single setting value.
     */
    public static function get( $key, $default = null ) {
        $opts = get_option( 'wpkko_epub_settings', array() );
        return isset( $opts[ $key ] ) ? $opts[ $key ] : $default;
    }
}
