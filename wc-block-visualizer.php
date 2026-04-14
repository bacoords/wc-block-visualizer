<?php
/**
 * Plugin Name: WooCommerce Block Visualizer
 * Description: Developer tool that displays visual outlines and class name labels for WooCommerce block components on the frontend.
 * Version: 1.0.0
 * Author: Developer
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * WC requires at least: 8.0
 * License: GPL v2 or later
 */

defined( 'ABSPATH' ) || exit;

class WC_Block_Visualizer {

	/**
	 * Instance of this class.
	 *
	 * @var WC_Block_Visualizer
	 */
	private static $instance = null;

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	const VERSION = '1.0.0';

	/**
	 * Get the singleton instance.
	 *
	 * @return WC_Block_Visualizer
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'init' ) );
	}

	/**
	 * Initialize the plugin.
	 */
	public function init() {
		// Admin bar toggle only for logged-in users with manage_woocommerce capability.
		if ( is_user_logged_in() && current_user_can( 'manage_woocommerce' ) ) {
			add_action( 'admin_bar_menu', array( $this, 'add_admin_bar_toggle' ), 100 );
		}

		// Assets available to all users (enabled via query param or cookie).
		add_action( 'wp_enqueue_scripts', array( $this, 'maybe_enqueue_assets' ) );
	}

	/**
	 * Check if visualizer is enabled.
	 *
	 * @return bool
	 */
	private function is_enabled() {
		// Check query parameter.
		if ( isset( $_GET['wc_block_visualizer'] ) ) {
			return '1' === $_GET['wc_block_visualizer'];
		}

		// Check cookie for persisted state.
		if ( isset( $_COOKIE['wc_block_visualizer'] ) ) {
			return '1' === $_COOKIE['wc_block_visualizer'];
		}

		return false;
	}

	/**
	 * Check if current page is a WooCommerce page.
	 *
	 * @return bool
	 */
	private function is_woocommerce_page() {
		if ( ! function_exists( 'is_woocommerce' ) ) {
			return false;
		}

		return is_woocommerce()
			|| is_cart()
			|| is_checkout()
			|| is_account_page()
			|| is_wc_endpoint_url()
			|| is_order_received_page();
	}

	/**
	 * Add admin bar toggle button.
	 *
	 * @param WP_Admin_Bar $admin_bar Admin bar instance.
	 */
	public function add_admin_bar_toggle( $admin_bar ) {
		if ( is_admin() || ! $this->is_woocommerce_page() ) {
			return;
		}

		$is_enabled = $this->is_enabled();
		$current_url = ( is_ssl() ? 'https://' : 'http://' ) . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

		// Build toggle URL.
		$toggle_value = $is_enabled ? '0' : '1';
		$toggle_url = add_query_arg( 'wc_block_visualizer', $toggle_value, $current_url );

		$admin_bar->add_node(
			array(
				'id'    => 'wc-block-visualizer',
				'title' => sprintf(
					'<span style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%%;background:%s;"></span>Block Visualizer: %s</span>',
					$is_enabled ? '#4ade80' : '#94a3b8',
					$is_enabled ? 'ON' : 'OFF'
				),
				'href'  => $toggle_url,
				'meta'  => array(
					'title' => $is_enabled ? 'Click to disable Block Visualizer' : 'Click to enable Block Visualizer',
				),
			)
		);
	}

	/**
	 * Conditionally enqueue assets.
	 */
	public function maybe_enqueue_assets() {
		// If enabled via query param, load on any page.
		// Otherwise, only load on WooCommerce pages.
		if ( ! $this->is_enabled() ) {
			return;
		}

		// If not explicitly enabled via query param, check for WooCommerce page.
		if ( ! isset( $_GET['wc_block_visualizer'] ) && ! $this->is_woocommerce_page() ) {
			return;
		}

		$plugin_url = plugin_dir_url( __FILE__ );

		wp_enqueue_style(
			'wc-block-visualizer',
			$plugin_url . 'assets/css/visualizer.css',
			array(),
			self::VERSION
		);

		wp_enqueue_script(
			'wc-block-visualizer',
			$plugin_url . 'assets/js/visualizer.js',
			array(),
			self::VERSION,
			true
		);

		// Pass config to JS.
		wp_localize_script(
			'wc-block-visualizer',
			'wcBlockVisualizerConfig',
			array(
				'enabled' => true,
			)
		);
	}
}

// Initialize the plugin.
WC_Block_Visualizer::get_instance();
