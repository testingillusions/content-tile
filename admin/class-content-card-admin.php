<?php
/**
 * Content Card Admin Settings Class
 * 
 * Handles admin settings page and configuration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Content_Card_Admin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'init_settings'));
        add_action('wp_ajax_get_suremembers_groups', array($this, 'ajax_get_suremembers_groups'));
    }
    
    /**
     * Add admin menu page
     */
    public function add_admin_menu() {
        add_options_page(
            'Content Card Settings',
            'Content Card',
            'manage_options',
            'content-card-settings',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Initialize settings
     */
    public function init_settings() {
        register_setting('content_card_settings_group', 'content_card_settings');
        
        // Default values section
        add_settings_section(
            'content_card_defaults',
            'Default Attributes',
            array($this, 'defaults_section_callback'),
            'content-card-settings'
        );
        
        // Styling section
        add_settings_section(
            'content_card_styling',
            'Styling Options',
            array($this, 'styling_section_callback'),
            'content-card-settings'
        );
        
        // Default attribute fields
        $default_fields = array(
            'default_title' => 'Default Title',
            'default_image' => 'Default Image URL',
            'default_button1_text' => 'Default Button 1 Text',
            'default_button1_url' => 'Default Button 1 URL',
            'default_button2_text' => 'Default Button 2 Text',
            'default_button2_url' => 'Default Button 2 URL',
            'default_button3_text' => 'Default Button 3 Text',
            'default_button3_url' => 'Default Button 3 URL'
        );
        
        foreach ($default_fields as $field_id => $field_title) {
            add_settings_field(
                $field_id,
                $field_title,
                array($this, 'render_text_field'),
                'content-card-settings',
                'content_card_defaults',
                array('field_id' => $field_id)
            );
        }
        
        // Styling fields
        $styling_fields = array(
            'accent_color' => 'Accent Color',
            'border_color' => 'Border Color',
            'bg_color' => 'Background Color'
        );
        
        foreach ($styling_fields as $field_id => $field_title) {
            add_settings_field(
                $field_id,
                $field_title,
                array($this, 'render_color_field'),
                'content-card-settings',
                'content_card_styling',
                array('field_id' => $field_id)
            );
        }
        
        add_settings_field(
            'border_radius',
            'Border Radius (px)',
            array($this, 'render_number_field'),
            'content-card-settings',
            'content_card_styling',
            array('field_id' => 'border_radius')
        );
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        include CONTENT_CARD_PLUGIN_PATH . 'admin/settings-page.php';
    }
    
    /**
     * Section callbacks
     */
    public function defaults_section_callback() {
        echo '<p>Set default values for shortcode attributes. These will be used when attributes are not specified in the shortcode.</p>';
    }
    
    public function styling_section_callback() {
        echo '<p>Customize the visual appearance of content cards across your site.</p>';
    }
    
    /**
     * Render text field
     */
    public function render_text_field($args) {
        $settings = get_option('content_card_settings', array());
        $field_id = $args['field_id'];
        $value = $settings[$field_id] ?? '';
        
        echo '<input type="text" name="content_card_settings[' . esc_attr($field_id) . ']" value="' . esc_attr($value) . '" class="regular-text" />';
    }
    
    /**
     * Render color field
     */
    public function render_color_field($args) {
        $settings = get_option('content_card_settings', array());
        $field_id = $args['field_id'];
        $value = $settings[$field_id] ?? '#007cba';
        
        echo '<input type="color" name="content_card_settings[' . esc_attr($field_id) . ']" value="' . esc_attr($value) . '" />';
    }
    
    /**
     * Render number field
     */
    public function render_number_field($args) {
        $settings = get_option('content_card_settings', array());
        $field_id = $args['field_id'];
        $value = $settings[$field_id] ?? '8';
        
        echo '<input type="number" name="content_card_settings[' . esc_attr($field_id) . ']" value="' . esc_attr($value) . '" min="0" max="50" />';
    }
    
    /**
     * Get available SureMembers groups
     */
    public function get_sure_members_groups() {
        $groups = array();
        
        if (class_exists('SureMembers\\Inc\\Access_Groups')) {
            try {
                // Get active access groups using SureMembers API
                $groups = SureMembers\Inc\Access_Groups::get_active();
            } catch (Exception $e) {
                // Handle error gracefully
            }
        }
        
        return $groups;
    }
    
    /**
     * AJAX handler to get SureMembers groups
     */
    public function ajax_get_suremembers_groups() {
        // Verify nonce for security
        if (!wp_verify_nonce($_POST['nonce'], 'content_card_groups_nonce')) {
            wp_die('Security check failed');
        }
        
        $groups = $this->get_sure_members_groups();
        
        wp_send_json_success($groups);
    }
}
