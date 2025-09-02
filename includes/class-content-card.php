<?php
/**
 * Content Card Main Class
 * 
 * Handles shortcode registration and rendering
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Content_Card {
    
    public function __construct() {
        add_action('init', array($this, 'register_shortcode'));
        add_action('wp_head', array($this, 'add_inline_styles'));
    }
    
    /**
     * Register the content_card shortcode
     */
    public function register_shortcode() {
        add_shortcode('content_card', array($this, 'render_content_card'));
    }
    
    /**
     * Render the content card shortcode
     */
    public function render_content_card($atts) {
        $settings = get_option('content_card_settings', array());
        
        // Parse shortcode attributes with defaults from settings
        $atts = shortcode_atts(array(
            'access_group_ids' => '',
            'title' => $settings['default_title'] ?? 'Content Card Title',
            'image' => $settings['default_image'] ?? 'https://testingillusions.com/wp-content/uploads/2025/08/compare-643305_640_1.png',
            'image_scaling' => 'cover',
            'link1_text' => 'Plan Comparison Tool',
            'link1_url' => '',
            'link2_text' => 'PCT FAQ',
            'link2_url' => '',
            'link3_text' => 'PCT Helpful Hints',
            'link3_url' => '',
            'upgrade_text' => $settings['default_upgrade_text'] ?? 'Upgrade Now for Access',
            'upgrade_url' => $settings['default_upgrade_url'] ?? '#',
            'demo_text' => $settings['default_demo_text'] ?? 'Schedule Demo',
            'demo_url' => $settings['default_demo_url'] ?? '#'
        ), $atts);
        
        // Check user access
        $has_access = $this->check_user_access($atts['access_group_ids']);
        
        // Generate unique ID for this card instance
        $card_id = 'content-card-' . uniqid();
        
        ob_start();
        ?>
        <div id="<?php echo esc_attr($card_id); ?>" class="content-card-container">
            <div class="content-card">
                <h3 class="content-card-title"><?php echo esc_html($atts['title']); ?></h3>
                <div class="content-card-body">
                    <div class="content-card-image">
                        <img src="<?php echo esc_url($atts['image']); ?>" 
                             alt="<?php echo esc_attr($atts['title']); ?>"
                             style="object-fit: <?php echo esc_attr($atts['image_scaling']); ?>;">
                    </div>
                    <div class="content-card-content">
                        <div class="content-card-links">
                            <?php if (!empty($atts['link1_text']) && !empty($atts['link1_url'])): ?>
                                <a href="<?php echo esc_url($atts['link1_url']); ?>" class="content-card-link">
                                    <?php echo esc_html($atts['link1_text']); ?>
                                </a>
                            <?php endif; ?>
                            <?php if (!empty($atts['link2_text']) && !empty($atts['link2_url'])): ?>
                                <a href="<?php echo esc_url($atts['link2_url']); ?>" class="content-card-link">
                                    <?php echo esc_html($atts['link2_text']); ?>
                                </a>
                            <?php endif; ?>
                            <?php if (!empty($atts['link3_text']) && !empty($atts['link3_url'])): ?>
                                <a href="<?php echo esc_url($atts['link3_url']); ?>" class="content-card-link">
                                    <?php echo esc_html($atts['link3_text']); ?>
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
                
                <?php if (!$has_access): ?>
                <div class="content-card-overlay" aria-label="Access required overlay">
                    <div class="content-card-overlay-content">
                        <h4>🔒 Premium Content</h4>
                        <div class="content-card-overlay-buttons">
                            <a href="<?php echo esc_url($atts['upgrade_url']); ?>" 
                               class="content-card-btn content-card-btn-primary">
                                <?php echo esc_html($atts['upgrade_text']); ?>
                            </a>
                            <a href="<?php echo esc_url($atts['demo_url']); ?>" 
                               class="content-card-btn content-card-btn-secondary">
                                <?php echo esc_html($atts['demo_text']); ?>
                            </a>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
        <?php
        
        return ob_get_clean();
    }
    
    /**
     * Check if user has access based on SureMembers groups
     */
    private function check_user_access($group_ids_string) {
        // If no group IDs specified, allow access
        if (empty($group_ids_string)) {
            return true;
        }
        
        // Check if SureMembers plugin is active
        if (!class_exists('SureMembers\\Inc\\Access_Groups')) {
            // If SureMembers is not active, allow access by default
            return true;
        }
        
        // Parse group IDs
        $group_ids = array_map('trim', explode(',', $group_ids_string));
        $group_ids = array_filter($group_ids, 'is_numeric');
        $group_ids = array_map('intval', $group_ids);
        
        if (empty($group_ids)) {
            return true;
        }
        
        // Check access using SureMembers
        try {
            // Use SureMembers static method to check user access
            // This method handles user login check and access group validation internally
            return SureMembers\Inc\Access_Groups::check_if_user_has_access($group_ids);
        } catch (Exception $e) {
            // If there's an error with SureMembers, allow access by default
            return true;
        }
    }
    
    /**
     * Add inline styles to the page header
     */
    public function add_inline_styles() {
        $settings = get_option('content_card_settings', array());
        
        $accent_color = $settings['accent_color'] ?? '#007cba';
        $border_color = $settings['border_color'] ?? '#ddd';
        $bg_color = $settings['bg_color'] ?? '#fff';
        $border_radius = $settings['border_radius'] ?? '8';
        
        ?>
        <style type="text/css">
        :root {
            --content-card-accent: <?php echo esc_attr($accent_color); ?>;
            --content-card-border: <?php echo esc_attr($border_color); ?>;
            --content-card-bg: <?php echo esc_attr($bg_color); ?>;
            --content-card-radius: <?php echo esc_attr($border_radius); ?>px;
        }
        
        .content-card-container {
            max-width: 800px;
            margin: 20px auto;
            position: relative;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .content-card {
            background: var(--content-card-bg);
            border: 1px solid #e8e8e8;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            position: relative;
            display: flex;
            flex-direction: column;
            min-height: 400px;
            max-height: 400px;
        }
        
        .content-card:hover {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
        }
        
        .content-card-title {
            font-size: 1.6em;
            font-weight: 700;
            margin: 0;
            color: #D4A574;
            text-align: center;
            padding: 20px 20px 15px 20px;
            border-bottom: 2px solid #f0f0f0;
            background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
            letter-spacing: 0.5px;
        }
        
        .content-card-body {
            display: flex;
            flex: 1;
            min-height: 0;
        }
        
        .content-card-image {
            flex: 1;
            position: relative;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            overflow: hidden;
        }
        
        .content-card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .content-card:hover .content-card-image img {
            transform: scale(1.05);
        }
        
        .content-card-content {
            flex: 1;
            padding: 0;
            background: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .content-card-links {
            display: flex;
            flex-direction: column;
            gap: 0;
            flex: 1;
            padding: 20px 0;
            justify-content: center;
        }
        
        .content-card-link {
            display: flex;
            align-items: center;
            padding: 18px 30px;
            background: transparent;
            color: #666;
            text-decoration: none;
            border: none;
            border-bottom: 1px solid #f5f5f5;
            text-align: left;
            transition: all 0.3s ease;
            font-weight: 500;
            font-size: 16px;
            position: relative;
        }
        
        .content-card-link:last-child {
            border-bottom: none;
        }
        
        .content-card-link:before {
            content: '▶';
            margin-right: 15px;
            font-size: 14px;
            color: #D4A574;
            transition: all 0.3s ease;
            opacity: 0.7;
        }
        
        .content-card-link:hover {
            background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%);
            color: #333;
            text-decoration: none;
            padding-left: 35px;
            border-left: 3px solid #D4A574;
        }
        
        .content-card-link:hover:before {
            color: #D4A574;
            opacity: 1;
            transform: translateX(5px);
        }
        
        .content-card-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(2px);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            z-index: 10;
        }
        
        .content-card-overlay-content {
            text-align: center;
            color: #333;
            padding: 30px 35px;
            max-width: 500px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
            position: relative;
        }
        
        .content-card-overlay-content h4 {
            font-size: 1.4em;
            margin: 0 0 25px 0;
            color: #333;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        
        .content-card-overlay-buttons {
            display: flex;
            flex-direction: row;
            gap: 15px;
            align-items: center;
            justify-content: center;
        }
        
        .content-card-btn {
            display: inline-block;
            padding: 14px 24px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            min-width: 160px;
            text-align: center;
            font-size: 14px;
            border: 2px solid transparent;
            cursor: pointer;
        }
        
        .content-card-btn-primary {
            background: #333;
            color: white;
            border-color: #333;
        }
        
        .content-card-btn-primary:hover {
            background: #555;
            color: white;
            text-decoration: none;
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .content-card-btn-secondary {
            background: white;
            color: #333;
            border: 2px solid #ddd;
        }
        
        .content-card-btn-secondary:hover {
            background: #f8f9fa;
            color: #333;
            text-decoration: none;
            border-color: #bbb;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
            .content-card {
                min-height: auto;
                max-height: none;
            }
            
            .content-card-body {
                flex-direction: column;
            }
            
            .content-card-image {
                flex: none;
                min-height: 200px;
                max-height: 200px;
            }
            
            .content-card-content {
                flex: none;
            }
            
            .content-card-container {
                max-width: 100%;
                margin: 20px 10px;
            }
            
            .content-card-title {
                font-size: 1.4em;
                padding: 15px 15px 12px 15px;
            }
            
            .content-card-links {
                padding: 15px 0;
            }
            
            .content-card-link {
                padding: 15px 20px;
                font-size: 15px;
            }
            
            .content-card-link:hover {
                padding-left: 25px;
                border-left: 2px solid #D4A574;
            }
            
            .content-card-overlay-content {
                padding: 25px 20px;
                margin: 15px;
                max-width: calc(100vw - 30px);
            }
            
            .content-card-overlay-buttons {
                flex-direction: column;
                gap: 12px;
            }
            
            .content-card-btn {
                width: 100%;
                padding: 14px 20px;
                min-width: auto;
            }
        }
        
        @media (max-width: 480px) {
            .content-card-overlay-content {
                padding: 20px 15px;
                margin: 10px;
            }
            
            .content-card-overlay-buttons {
                flex-direction: column;
                gap: 10px;
            }
            
            .content-card-btn {
                font-size: 14px;
                padding: 12px 16px;
                width: 100%;
            }
        }
        </style>
        <?php
    }
}
