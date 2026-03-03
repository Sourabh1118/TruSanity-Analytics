<?php
/**
 * Plugin Name: Trusanity Analytics
 * Description: Privacy-first behavioral analytics tracking. Connects your WordPress and WooCommerce site to your Trusanity Analytics workspace.
 * Version: 0.1.0
 * Author: Trusanity Open Source Team
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class TrusanityAnalyticsPlugin {
    
    public function __construct() {
        add_action('admin_menu', [$this, 'add_settings_page']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('wp_head', [$this, 'inject_tracking_script']);
        
        // WooCommerce Integration hooks
        if (in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
            add_action('woocommerce_thankyou', [$this, 'track_purchase_event']);
        }
    }

    public function add_settings_page() {
        add_options_page(
            'Trusanity Analytics Settings',
            'Trusanity Analytics',
            'manage_options',
            'trusanity-analytics',
            [$this, 'settings_page_html']
        );
    }

    public function register_settings() {
        register_setting('trusanity_analytics_group', 'trusanity_project_api_key');
        register_setting('trusanity_analytics_group', 'trusanity_ingest_url');
    }

    public function settings_page_html() {
        ?>
        <div class="wrap">
            <h1>Trusanity Analytics Configuration</h1>
            <form method="post" action="options.php">
                <?php settings_fields('trusanity_analytics_group'); ?>
                <?php do_settings_sections('trusanity_analytics_group'); ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Project API Key</th>
                        <td><input type="text" name="trusanity_project_api_key" value="<?php echo esc_attr(get_option('trusanity_project_api_key')); ?>" style="width: 350px;" /></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Ingest Base URL (Optional)</th>
                        <td><input type="text" name="trusanity_ingest_url" value="<?php echo esc_attr(get_option('trusanity_ingest_url', 'https://api.trusanity.com')); ?>" style="width: 350px;" placeholder="https://api.trusanity.com"/></td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function inject_tracking_script() {
        $api_key = get_option('trusanity_project_api_key');
        $ingest_url = get_option('trusanity_ingest_url', 'https://api.trusanity.com');
        
        if (empty($api_key)) return;
        
        // Optional: Exclude admin users
        if (is_user_logged_in() && current_user_can('manage_options')) return;

        ?>
        <!-- Trusanity Analytics Auto-Capture -->
        <script>
        (function(n,e,t,r,a){
            n.Trusanity=n.Trusanity||function(){(n.Trusanity.q=n.Trusanity.q||[]).push(arguments)};
            var s=e.createElement(t);s.async=1;s.src=r;
            var c=e.getElementsByTagName(t)[0];c.parentNode.insertBefore(s,c);
        })(window,document,'script','<?php echo esc_url($ingest_url); ?>/js/sdk.js');
        
        Trusanity('init', '<?php echo esc_js($api_key); ?>', { apiHost: '<?php echo esc_url($ingest_url); ?>' });
        
        // Identified user tracking
        <?php if (is_user_logged_in()): ?>
            Trusanity('identify', '<?php echo esc_js(wp_hash(get_current_user_id())); ?>');
        <?php endif; ?>
        </script>
        <?php
    }

    public function track_purchase_event($order_id) {
        $api_key = get_option('trusanity_project_api_key');
        $ingest_url = get_option('trusanity_ingest_url', 'https://api.trusanity.com');
        
        if (empty($api_key) || !$order_id) return;
        
        $order = wc_get_order($order_id);
        if (!$order) return;

        $items = [];
        foreach ($order->get_items() as $item) {
            $items[] = [
                'name' => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'total' => $item->get_total()
            ];
        }

        $payload = [
            'projectId' => $api_key,
            'events' => [
                [
                    'name' => 'Purchase_Completed',
                    'session_id' => 'server_side',
                    'anonymous_id' => wp_hash($order->get_billing_email()),
                    'timestamp' => current_time('mysql', 1),
                    'properties' => [
                        'order_id' => $order_id,
                        'revenue' => $order->get_total(),
                        'currency' => $order->get_currency(),
                        'items' => $items
                    ]
                ]
            ]
        ];

        wp_remote_post(trailingslashit($ingest_url) . 'v1/ingest', [
            'body' => wp_json_encode($payload),
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $api_key
            ],
            'blocking' => false, 
            'timeout' => 5
        ]);
    }
}

new TrusanityAnalyticsPlugin();
