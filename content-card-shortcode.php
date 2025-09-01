<?php
/**
 * Plugin Name: Content Card Shortcode
 * Plugin URI: https://example.com/content-card-shortcode
 * Description: A lightweight WordPress plugin that renders customizable content cards with conditional overlay access control using SureMembers integration.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: content-card-shortcode
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('CONTENT_CARD_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CONTENT_CARD_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('CONTENT_CARD_VERSION', '1.0.0');

// Include required files
require_once CONTENT_CARD_PLUGIN_PATH . 'includes/class-content-card.php';
require_once CONTENT_CARD_PLUGIN_PATH . 'admin/class-content-card-admin.php';

/**
 * Initialize the plugin
 */
function content_card_init() {
    // Initialize the main plugin class
    new Content_Card();
    
    // Initialize admin settings if in admin area
    if (is_admin()) {
        new Content_Card_Admin();
    }
}
add_action('plugins_loaded', 'content_card_init');

/**
 * Activation hook
 */
function content_card_activate() {
    // Set default options
    $default_options = array(
        'default_title' => 'Content Card Title',
        'default_image' => 'https://testingillusions.com/wp-content/uploads/2025/08/compare-643305_640_1.png',
        'default_upgrade_text' => 'Upgrade Now for Access',
        'default_upgrade_url' => '#',
        'default_demo_text' => 'Schedule Demo',
        'default_demo_url' => '#',
        'default_tool_url' => '#',
        'default_faq_url' => '#',
        'default_hints_url' => '#',
        'accent_color' => '#007cba',
        'border_color' => '#ddd',
        'bg_color' => '#fff',
        'border_radius' => '8'
    );
    
    add_option('content_card_settings', $default_options);
}
register_activation_hook(__FILE__, 'content_card_activate');

/**
 * Deactivation hook
 */
function content_card_deactivate() {
    // Clean up if needed
}
register_deactivation_hook(__FILE__, 'content_card_deactivate');

/**
 * Block initialization
 */
function content_card_register_block() {
    // Register the block
    wp_register_script(
        'content-card-block',
        CONTENT_CARD_PLUGIN_URL . 'assets/js/block.js',
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
        CONTENT_CARD_VERSION
    );

    wp_register_style(
        'content-card-block-style',
        CONTENT_CARD_PLUGIN_URL . 'assets/css/block.css',
        array(),
        CONTENT_CARD_VERSION
    );

    register_block_type('content-card/card', array(
        'editor_script' => 'content-card-block',
        'editor_style' => 'content-card-block-style',
        'style' => 'content-card-style'
    ));
}
add_action('init', 'content_card_register_block');

/**
 * Enqueue frontend styles
 */
function content_card_enqueue_styles() {
    wp_enqueue_style(
        'content-card-style',
        CONTENT_CARD_PLUGIN_URL . 'assets/css/style.css',
        array(),
        CONTENT_CARD_VERSION
    );
}
add_action('wp_enqueue_scripts', 'content_card_enqueue_styles');
