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
            'link1_text' => '',
            'link1_url' => '',
            'link2_text' => '',
            'link2_url' => '',
            'link3_text' => '',
            'link3_url' => '',
            'paragraph_text' => '',
            'button1_text' => $settings['default_button1_text'] ?? '',
            'button1_url' => $settings['default_button1_url'] ?? '',
            'button2_text' => $settings['default_button2_text'] ?? '',
            'button2_url' => $settings['default_button2_url'] ?? '',
            'button3_text' => $settings['default_button3_text'] ?? '',
            'button3_url' => $settings['default_button3_url'] ?? '',
            // Keep legacy attributes for backward compatibility
            'upgrade_text' => $settings['default_upgrade_text'] ?? '',
            'upgrade_url' => $settings['default_upgrade_url'] ?? '',
            'demo_text' => $settings['default_demo_text'] ?? '',
            'demo_url' => $settings['default_demo_url'] ?? ''
        ), $atts);
        
        // Check user access
        $has_access = $this->check_user_access($atts['access_group_ids']);
        
        // Generate unique ID for this card instance
        $card_id = 'content-card-' . uniqid();
        
        ob_start();
        ?>
        <div id="<?php echo esc_attr($card_id); ?>" 
             class="content-card-container" 
             data-access-groups="<?php echo esc_attr($atts['access_group_ids']); ?>"
             data-user-logged-in="<?php echo is_user_logged_in() ? '1' : '0'; ?>"
             data-has-access="<?php echo $has_access ? '1' : '0'; ?>">
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
                
                <?php if (!empty($atts['paragraph_text'])): ?>
                <div class="content-card-paragraph">
                    <p><?php echo esc_html($atts['paragraph_text']); ?></p>
                </div>
                <?php endif; ?>
                
                <?php if (!$has_access): ?>
                <div class="content-card-overlay" aria-label="Access required overlay">
                    <div class="content-card-overlay-content">
                        <h4>🔒 Premium Content</h4>
                        <div class="content-card-overlay-buttons">
                            <?php 
                            // Use only the new button system
                            $buttons = array();
                            
                            // Collect new button system buttons
                            if (!empty($atts['button1_text']) && !empty($atts['button1_url'])) {
                                $buttons[] = array('text' => $atts['button1_text'], 'url' => $atts['button1_url'], 'class' => 'primary');
                            }
                            if (!empty($atts['button2_text']) && !empty($atts['button2_url'])) {
                                $buttons[] = array('text' => $atts['button2_text'], 'url' => $atts['button2_url'], 'class' => 'secondary');
                            }
                            if (!empty($atts['button3_text']) && !empty($atts['button3_url'])) {
                                $buttons[] = array('text' => $atts['button3_text'], 'url' => $atts['button3_url'], 'class' => 'tertiary');
                            }
                            
                            // Render buttons
                            foreach ($buttons as $button): ?>
                                <a href="<?php echo esc_url($button['url']); ?>" 
                                   class="content-card-btn content-card-btn-<?php echo esc_attr($button['class']); ?>">
                                    <?php echo esc_html($button['text']); ?>
                                </a>
                            <?php endforeach; ?>
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
        
        // Ensure user is properly loaded
        if (!is_user_logged_in()) {
            return false;
        }
        
        // Get current user and ensure it's fresh
        $current_user = wp_get_current_user();
        if (!$current_user || !$current_user->exists()) {
            return false;
        }
        
        // Create a cache key for this specific user and group combination
        $cache_key = 'content_card_access_' . $current_user->ID . '_' . md5($group_ids_string);
        $cached_result = wp_cache_get($cache_key, 'content_card_access');
        
        // Use cached result if available and less than 30 seconds old
        if ($cached_result !== false && is_array($cached_result)) {
            $cache_time = $cached_result['time'] ?? 0;
            if ((time() - $cache_time) < 30) {
                return $cached_result['access'];
            }
        }
        
        // Check access using SureMembers with retry logic
        $access_granted = false;
        $max_attempts = 2;
        $attempt = 0;
        
        while ($attempt < $max_attempts && !$access_granted) {
            try {
                // Force refresh user capabilities on retry
                if ($attempt > 0) {
                    // Clear any user-related caches
                    wp_cache_delete($current_user->ID, 'users');
                    wp_cache_delete($current_user->ID, 'user_meta');
                    
                    // Small delay to allow for session sync
                    usleep(100000); // 0.1 seconds
                }
                
                // Use SureMembers static method to check user access
                $access_granted = SureMembers\Inc\Access_Groups::check_if_user_has_access($group_ids);
                
                // If we got a definitive result, break out of retry loop
                if ($access_granted === true || $attempt === ($max_attempts - 1)) {
                    break;
                }
                
            } catch (Exception $e) {
                // Log the error for debugging
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Content Card Access Check Error (Attempt ' . ($attempt + 1) . '): ' . $e->getMessage());
                }
                
                // On final attempt, default to no access for security
                if ($attempt === ($max_attempts - 1)) {
                    $access_granted = false;
                }
            }
            
            $attempt++;
        }
        
        // Cache the result for 30 seconds to prevent repeated API calls
        wp_cache_set($cache_key, array(
            'access' => $access_granted,
            'time' => time()
        ), 'content_card_access', 30);
        
        return $access_granted;
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
            min-height: 250px;
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
        
        .content-card-paragraph {
            padding: 15px 20px;
            background: #f9f9f9;
            border-top: 1px solid #e8e8e8;
            text-align: center;
        }
        
        .content-card-paragraph p {
            margin: 0;
            color: #666;
            font-size: 14px;
            line-height: 1.5;
            font-style: italic;
            font-weight: bold;
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
            flex-wrap: wrap;
            gap: 15px;
            align-items: center;
            justify-content: center;
            max-width: 100%;
        }
        
        .content-card-overlay-buttons .content-card-btn:nth-child(1),
        .content-card-overlay-buttons .content-card-btn:nth-child(2) {
            flex: 1;
            min-width: 140px;
            max-width: 180px;
        }
        
        .content-card-overlay-buttons .content-card-btn:nth-child(3) {
            flex-basis: 100%;
            max-width: 200px;
            margin: 5px auto 0 auto;
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
        
        .content-card-btn-tertiary {
            background: transparent;
            color: #666;
            border: 2px solid #ddd;
        }
        
        .content-card-btn-tertiary:hover {
            background: #f0f0f0;
            color: #333;
            text-decoration: none;
            border-color: #999;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        @media (max-width: 768px) {
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
            
            .content-card-paragraph {
                padding: 12px 15px;
            }
            
            .content-card-paragraph p {
                font-size: 13px;
            }
        }
        
        /* Access checking state */
        .content-card-checking-access {
            opacity: 0.7;
            transition: opacity 0.3s ease;
        }
        
        .content-card-checking-access::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #D4A574;
            border-radius: 50%;
            animation: content-card-spin 1s linear infinite;
            z-index: 1000;
        }
        
        @keyframes content-card-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
