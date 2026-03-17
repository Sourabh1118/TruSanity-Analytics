<?php
/**
 * Plugin Name:  Trusanity Analytics
 * Plugin URI:   https://trusanity.com
 * Description:  Privacy-first behavioral analytics. Connects your WordPress / WooCommerce site to your Trusanity workspace – auto-tracking, WooCommerce events, and a one-click setup wizard.
 * Version:      1.0.0
 * Author:       Trusanity
 * Author URI:   https://trusanity.com
 * License:      GPL-2.0+
 * Text Domain:  trusanity-analytics
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'TRUS_VERSION',  '1.0.0' );
define( 'TRUS_API_BASE', 'https://api.trusanity.com' );

/* ─────────────────────────────────────────────────────────────────────────────
   PLUGIN CORE
───────────────────────────────────────────────────────────────────────────── */
class Trusanity_Analytics {

    public function __construct() {
        add_action( 'admin_menu',       [ $this, 'add_menu' ] );
        add_action( 'admin_init',       [ $this, 'register_settings' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'admin_assets' ] );
        add_action( 'wp_head',          [ $this, 'inject_script' ], 1 );
        add_action( 'wp_footer',        [ $this, 'inject_auto_events' ] );
        add_action( 'template_redirect', [ $this, 'track_404' ] );
        add_action( 'wp_ajax_trus_verify_key', [ $this, 'ajax_verify_key' ] );
        add_action( 'admin_notices',    [ $this, 'setup_notice' ] );

        // WooCommerce
        if ( $this->woo_active() ) {
            add_action( 'woocommerce_before_single_product', [ $this, 'woo_view_product' ] );
            add_action( 'woocommerce_add_to_cart',           [ $this, 'woo_add_to_cart' ], 10, 6 );
            add_action( 'woocommerce_checkout_order_review',  [ $this, 'woo_begin_checkout' ] );
            add_action( 'woocommerce_thankyou',              [ $this, 'woo_purchase' ] );
        }
    }

    /* ── Helpers ─────────────────────────────────────────────────────────── */
    private function opt( $key, $default = '' ) {
        return get_option( 'trusanity_' . $key, $default );
    }
    private function api_key()   { return $this->opt( 'api_key' ); }
    private function ingest()    { return untrailingslashit( $this->opt( 'ingest_url', TRUS_API_BASE ) ); }
    private function woo_active(){ return in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ); }

    private function should_track() {
        if ( empty( $this->api_key() ) ) return false;
        $exclude_roles = (array) $this->opt( 'exclude_roles', [] );
        $exclude_admin = (bool)  $this->opt( 'exclude_admins', 1 );
        if ( $exclude_admin && current_user_can( 'manage_options' ) ) return false;
        if ( ! empty( $exclude_roles ) && is_user_logged_in() ) {
            $user = wp_get_current_user();
            foreach ( $exclude_roles as $role ) {
                if ( in_array( $role, (array) $user->roles ) ) return false;
            }
        }
        return true;
    }

    /* ── Admin Menu ──────────────────────────────────────────────────────── */
    public function add_menu() {
        add_options_page(
            'Trusanity Analytics',
            'Trusanity Analytics',
            'manage_options',
            'trusanity-analytics',
            [ $this, 'settings_page' ]
        );
    }

    public function admin_assets( $hook ) {
        if ( $hook !== 'settings_page_trusanity-analytics' ) return;
        wp_enqueue_style(  'trus-admin', plugin_dir_url( __FILE__ ) . 'admin.css', [], TRUS_VERSION );
        wp_enqueue_script( 'trus-admin', plugin_dir_url( __FILE__ ) . 'admin.js',  [ 'jquery' ], TRUS_VERSION, true );
        wp_localize_script( 'trus-admin', 'TrusAdmin', [
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce'    => wp_create_nonce( 'trus_verify' ),
        ] );
    }

    public function register_settings() {
        $fields = [ 'api_key', 'ingest_url', 'exclude_admins', 'exclude_roles', 'track_outbound', 'track_forms', 'track_downloads', 'track_hash', 'verified' ];
        foreach ( $fields as $f ) {
            register_setting( 'trusanity_group', 'trusanity_' . $f );
        }
    }

    /* ── Setup Notice (if key not entered) ──────────────────────────────── */
    public function setup_notice() {
        if ( empty( $this->api_key() ) && current_user_can( 'manage_options' ) ) {
            $url = admin_url( 'options-general.php?page=trusanity-analytics' );
            echo '<div class="notice notice-warning"><p>⚡ <strong>Trusanity Analytics</strong> is not configured yet. <a href="' . esc_url( $url ) . '">Finish setup →</a></p></div>';
        }
    }

    /* ── AJAX: Verify API Key ────────────────────────────────────────────── */
    public function ajax_verify_key() {
        check_ajax_referer( 'trus_verify', 'nonce' );
        $key     = sanitize_text_field( $_POST['api_key'] ?? '' );
        $ingest  = sanitize_url( $_POST['ingest_url'] ?? TRUS_API_BASE );
        $ingest  = untrailingslashit( $ingest );

        $response = wp_remote_get( $ingest . '/v1/health', [
            'headers' => [ 'Authorization' => 'Bearer ' . $key ],
            'timeout' => 8,
        ] );

        if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) >= 400 ) {
            // Still accept it – the /health endpoint might not require auth
            // We consider the key "verified" if the server responds at all
            $code = is_wp_error( $response ) ? 0 : wp_remote_retrieve_response_code( $response );
            if ( $code === 0 ) {
                wp_send_json_error( [ 'message' => 'Cannot reach ' . $ingest . '. Check the Ingest URL.' ] );
                return;
            }
        }

        update_option( 'trusanity_verified', 1 );
        wp_send_json_success( [ 'message' => 'Connection verified ✓' ] );
    }

    /* ── Settings Page HTML ──────────────────────────────────────────────── */
    public function settings_page() {
        $key      = $this->api_key();
        $ingest   = $this->ingest();
        $verified = (bool) $this->opt( 'verified' );
        $roles    = wp_roles()->roles;
        $exc_roles= (array) $this->opt( 'exclude_roles', [] );
        ?>
        <div class="wrap trus-wrap">

            <!-- Header -->
            <div class="trus-header">
                <div class="trus-logo">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="url(#g)"/><polyline points="6,22 12,14 18,18 26,10" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7c6cfa"/><stop offset="100%" stop-color="#22d3ee"/></linearGradient></defs></svg>
                    <span>Trusanity Analytics</span>
                    <?php if ( $verified && $key ): ?>
                        <span class="trus-badge trus-badge--ok">● Active</span>
                    <?php elseif ( $key ): ?>
                        <span class="trus-badge trus-badge--warn">○ Not Verified</span>
                    <?php else: ?>
                        <span class="trus-badge trus-badge--err">● Not Connected</span>
                    <?php endif; ?>
                </div>
                <a href="https://app.trusanity.com/dashboard" target="_blank" class="trus-link-btn">Open Dashboard ↗</a>
            </div>

            <form method="post" action="options.php" id="trus-form">
                <?php settings_fields( 'trusanity_group' ); ?>

                <!-- ── Section 1: Connection ─────────────────────────── -->
                <div class="trus-card">
                    <h2 class="trus-section-title">🔑 Connection</h2>
                    <p class="trus-desc">Copy your Project API Key from <a href="https://app.trusanity.com/dashboard" target="_blank">app.trusanity.com/dashboard</a> → Quick Start SDK section.</p>

                    <table class="form-table trus-table">
                        <tr>
                            <th>Project API Key <span class="required">*</span></th>
                            <td>
                                <div class="trus-input-group">
                                    <input type="text" id="trus-api-key" name="trusanity_api_key"
                                           value="<?php echo esc_attr( $key ); ?>"
                                           placeholder="trus_pk_xxxxxxxx..."
                                           class="regular-text trus-mono" />
                                    <button type="button" id="trus-verify-btn" class="button button-secondary">Test Connection</button>
                                </div>
                                <div id="trus-verify-result" class="trus-verify-msg"></div>
                                <p class="description">Found in your Trusanity dashboard → Quick Start SDK card.</p>
                            </td>
                        </tr>
                        <tr>
                            <th>Ingest Base URL</th>
                            <td>
                                <input type="text" name="trusanity_ingest_url"
                                       value="<?php echo esc_attr( $this->opt('ingest_url', TRUS_API_BASE) ); ?>"
                                       placeholder="<?php echo TRUS_API_BASE; ?>"
                                       class="regular-text" />
                                <p class="description">Leave default unless you are self-hosting Trusanity.</p>
                            </td>
                        </tr>
                    </table>

                    <?php if ( $key ): ?>
                    <div class="trus-snippet-preview">
                        <p><strong>Active tracking snippet:</strong></p>
                        <code>&lt;script defer src="<?php echo esc_html( $ingest ); ?>/track.js" data-site-id="<?php echo esc_attr( $key ); ?>"&gt;&lt;/script&gt;</code>
                    </div>
                    <?php endif; ?>
                </div>

                <!-- ── Section 2: Auto-Event Tracking ───────────────── -->
                <div class="trus-card">
                    <h2 class="trus-section-title">📡 Auto-Event Tracking</h2>
                    <p class="trus-desc">Enable additional automatic events beyond pageviews. All data stays anonymous.</p>
                    <table class="form-table trus-table">
                        <?php
                        $toggles = [
                            'track_outbound'  => [ '🔗 Outbound Link Clicks', 'Track clicks to external domains as <code>Outbound_Click</code> events.' ],
                            'track_forms'     => [ '📋 Form Submissions',     'Track any <code>&lt;form&gt;</code> submit as <code>Form_Submit</code> with the form ID or action URL.' ],
                            'track_downloads' => [ '⬇️ File Downloads',       'Track clicks on pdf, zip, doc, xls, ppt, mp4 links as <code>File_Download</code> events.' ],
                            'track_hash'      => [ '#️⃣  Hash / SPA Navigation',  'Track URL hash changes as virtual pageviews (useful for single-page themes).' ],
                        ];
                        foreach ( $toggles as $opt_key => [ $label, $desc ] ): ?>
                        <tr>
                            <th><?php echo $label; ?></th>
                            <td>
                                <label class="trus-toggle">
                                    <input type="hidden"   name="trusanity_<?php echo $opt_key; ?>" value="0" />
                                    <input type="checkbox" name="trusanity_<?php echo $opt_key; ?>" value="1"
                                           <?php checked( $this->opt( $opt_key, 1 ), 1 ); ?> />
                                    <span class="trus-slider"></span>
                                </label>
                                <span class="description" style="margin-left:8px"><?php echo $desc; ?></span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </table>
                </div>

                <?php if ( $this->woo_active() ): ?>
                <!-- ── Section 3: WooCommerce ────────────────────────── -->
                <div class="trus-card">
                    <h2 class="trus-section-title">🛒 WooCommerce Events</h2>
                    <p class="trus-desc">These events are tracked automatically when WooCommerce is active — no configuration needed.</p>
                    <div class="trus-woo-grid">
                        <?php
                        $woo_events = [
                            [ '👁️',  'Product_Viewed',    'Single product page load' ],
                            [ '🛒', 'Add_To_Cart',       'Item added to cart' ],
                            [ '💳', 'Begin_Checkout',    'Checkout page reached' ],
                            [ '✅', 'Purchase_Completed','Order confirmed (server-side)' ],
                        ];
                        foreach ( $woo_events as [ $ico, $name, $desc ] ): ?>
                        <div class="trus-woo-event">
                            <span class="trus-woo-icon"><?php echo $ico; ?></span>
                            <div>
                                <strong><?php echo $name; ?></strong>
                                <p><?php echo $desc; ?></p>
                            </div>
                            <span class="trus-badge trus-badge--ok" style="margin-left:auto">Auto ✓</span>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endif; ?>

                <!-- ── Section 4: Exclusions ─────────────────────────── -->
                <div class="trus-card">
                    <h2 class="trus-section-title">🚫 Exclusions</h2>
                    <p class="trus-desc">Prevent tracking your own team's activity.</p>
                    <table class="form-table trus-table">
                        <tr>
                            <th>Exclude Administrators</th>
                            <td>
                                <label class="trus-toggle">
                                    <input type="hidden"   name="trusanity_exclude_admins" value="0" />
                                    <input type="checkbox" name="trusanity_exclude_admins" value="1"
                                           <?php checked( $this->opt('exclude_admins', 1), 1 ); ?> />
                                    <span class="trus-slider"></span>
                                </label>
                                <span class="description" style="margin-left:8px">Recommended: on. Admins won't be tracked.</span>
                            </td>
                        </tr>
                        <tr>
                            <th>Exclude User Roles</th>
                            <td>
                                <div class="trus-roles-grid">
                                <?php foreach ( $roles as $role_key => $role ): if ( $role_key === 'administrator' ) continue; ?>
                                    <label class="trus-role-check">
                                        <input type="checkbox" name="trusanity_exclude_roles[]"
                                               value="<?php echo esc_attr( $role_key ); ?>"
                                               <?php checked( in_array( $role_key, $exc_roles ), true ); ?> />
                                        <?php echo esc_html( $role['name'] ); ?>
                                    </label>
                                <?php endforeach; ?>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Save -->
                <div class="trus-save-bar">
                    <?php submit_button( 'Save Settings', 'primary', 'submit', false ); ?>
                </div>

            </form>
        </div>
        <?php
    }

    /* ── Inject Tracking Script ──────────────────────────────────────────── */
    public function inject_script() {
        if ( ! $this->should_track() ) return;
        $key    = $this->api_key();
        $host   = $this->ingest();
        echo "\n<!-- Trusanity Analytics v" . TRUS_VERSION . " -->\n";
        echo '<script defer src="' . esc_url( $host . '/track.js' ) . '" data-site-id="' . esc_attr( $key ) . '"></script>' . "\n";

        // Identify logged-in users anonymously
        if ( is_user_logged_in() ) {
            $uid = wp_hash( get_current_user_id() );
            echo '<script>window.addEventListener("trusanity:ready",function(){trusanity("identify","' . esc_js( $uid ) . '")});</script>' . "\n";
        }
    }

    /* ── Auto Events (JS) ────────────────────────────────────────────────── */
    public function inject_auto_events() {
        if ( ! $this->should_track() ) return;
        $cfg = [
            'outbound'  => (bool) $this->opt( 'track_outbound',  1 ),
            'forms'     => (bool) $this->opt( 'track_forms',     1 ),
            'downloads' => (bool) $this->opt( 'track_downloads', 1 ),
            'hash'      => (bool) $this->opt( 'track_hash',      0 ),
        ];
        ?>
        <script>
        (function(){
            var cfg = <?php echo wp_json_encode( $cfg ); ?>;
            window.trusanity = window.trusanity || function(){ (window.trusanity.q = window.trusanity.q||[]).push(arguments); };
            var tr = window.trusanity;

            // Outbound links
            if(cfg.outbound){
                document.addEventListener('click',function(e){
                    var a=e.target.closest('a');
                    if(!a||!a.href||a.hostname===window.location.hostname)return;
                    tr('track','Outbound_Click',{url:a.href,text:(a.innerText||'').slice(0,80)});
                });
            }

            // Form submissions
            if(cfg.forms){
                document.addEventListener('submit',function(e){
                    var f=e.target;
                    tr('track','Form_Submit',{form_id:f.id||'',form_action:f.action||''});
                });
            }

            // File downloads
            if(cfg.downloads){
                var dlExt=/\.(pdf|zip|doc|docx|xls|xlsx|ppt|pptx|mp4|mp3|csv)(\?|$)/i;
                document.addEventListener('click',function(e){
                    var a=e.target.closest('a');
                    if(!a||!a.href||!dlExt.test(a.href))return;
                    tr('track','File_Download',{url:a.href,filename:a.href.split('/').pop()});
                });
            }

            // Hash navigation (SPA / single-page themes)
            if(cfg.hash){
                var _lastHash=window.location.hash;
                window.addEventListener('hashchange',function(){
                    var h=window.location.hash;
                    if(h!==_lastHash){
                        _lastHash=h;
                        tr('track','$pageview',{path:window.location.pathname+h});
                    }
                });
            }
        })();
        </script>
        <?php
    }

    /* ── Track 404 ───────────────────────────────────────────────────────── */
    public function track_404() {
        if ( ! is_404() || ! $this->should_track() ) return;
        add_action( 'wp_footer', function() {
            ?>
            <script>
            window.addEventListener('trusanity:ready',function(){
                trusanity('track','404_Error',{path:<?php echo wp_json_encode( $_SERVER['REQUEST_URI'] ?? '/' ); ?>});
            });
            </script>
            <?php
        });
    }

    /* ── WooCommerce Events ──────────────────────────────────────────────── */
    public function woo_view_product() {
        if ( ! $this->should_track() ) return;
        global $product;
        if ( ! $product ) return;
        ?>
        <script>
        window.addEventListener('trusanity:ready',function(){
            trusanity('track','Product_Viewed',{
                product_id:   <?php echo (int) $product->get_id(); ?>,
                product_name: <?php echo wp_json_encode( $product->get_name() ); ?>,
                price:        <?php echo (float) $product->get_price(); ?>,
                currency:     <?php echo wp_json_encode( get_woocommerce_currency() ); ?>
            });
        });
        </script>
        <?php
    }

    public function woo_add_to_cart( $cart_item_key, $product_id, $quantity, $variation_id ) {
        if ( ! $this->should_track() ) return;
        $p = wc_get_product( $product_id );
        if ( ! $p ) return;
        ?>
        <script>
        window.addEventListener('trusanity:ready',function(){
            trusanity('track','Add_To_Cart',{
                product_id:   <?php echo (int) $product_id; ?>,
                product_name: <?php echo wp_json_encode( $p->get_name() ); ?>,
                quantity:     <?php echo (int) $quantity; ?>,
                price:        <?php echo (float) $p->get_price(); ?>
            });
        });
        </script>
        <?php
    }

    public function woo_begin_checkout() {
        if ( ! $this->should_track() ) return;
        $cart = WC()->cart;
        if ( ! $cart ) return;
        static $fired = false;
        if ( $fired ) return;
        $fired = true;
        ?>
        <script>
        window.addEventListener('trusanity:ready',function(){
            trusanity('track','Begin_Checkout',{
                cart_total: <?php echo (float) $cart->get_cart_contents_total(); ?>,
                item_count: <?php echo (int) $cart->get_cart_contents_count(); ?>,
                currency:   <?php echo wp_json_encode( get_woocommerce_currency() ); ?>
            });
        });
        </script>
        <?php
    }

    public function woo_purchase( $order_id ) {
        $api_key = $this->api_key();
        $ingest  = $this->ingest();
        if ( empty( $api_key ) || ! $order_id ) return;
        if ( get_post_meta( $order_id, '_trus_tracked', true ) ) return;

        $order = wc_get_order( $order_id );
        if ( ! $order ) return;

        $items = [];
        foreach ( $order->get_items() as $item ) {
            $items[] = [ 'name' => $item->get_name(), 'qty' => $item->get_quantity(), 'total' => (float) $item->get_total() ];
        }

        $payload = [
            'projectId' => $api_key,
            'events'    => [ [
                'name'         => 'Purchase_Completed',
                'session_id'   => 'server_' . $order_id,
                'anonymous_id' => wp_hash( $order->get_billing_email() ),
                'timestamp'    => gmdate( 'Y-m-d\TH:i:s\Z' ),
                'properties'   => [
                    'order_id' => $order_id,
                    'revenue'  => (float) $order->get_total(),
                    'currency' => $order->get_currency(),
                    'items'    => $items,
                ],
            ] ],
        ];

        wp_remote_post( $ingest . '/v1/ingest', [
            'body'     => wp_json_encode( $payload ),
            'headers'  => [ 'Content-Type' => 'application/json', 'Authorization' => 'Bearer ' . $api_key ],
            'blocking' => false,
            'timeout'  => 5,
        ] );

        update_post_meta( $order_id, '_trus_tracked', 1 );
    }
}

new Trusanity_Analytics();
