<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <div class="content-card-admin-wrapper">
        <div class="content-card-admin-main">
            <form method="post" action="options.php">
                <?php
                settings_fields('content_card_settings_group');
                do_settings_sections('content-card-settings');
                submit_button();
                ?>
            </form>
        </div>
        
        <div class="content-card-admin-sidebar">
            <div class="postbox">
                <h3 class="hndle"><span>Usage Instructions</span></h3>
                <div class="inside">
                    <h4>Shortcode Usage</h4>
                    <p>Use the <code>[content_card]</code> shortcode in any post or page:</p>
                    <pre><code>[content_card 
  title="My Custom Card"
  access_group_ids="1,2,3"
  image="https://example.com/image.jpg"
  upgrade_text="Get Access"
  upgrade_url="/upgrade"
]</code></pre>
                    
                    <h4>Gutenberg Block</h4>
                    <p>Search for "Content Card" in the block editor to add a visual block with the same functionality.</p>
                    
                    <h4>Available Attributes</h4>
                    <ul>
                        <li><strong>access_group_ids:</strong> Comma-separated SureMembers group IDs</li>
                        <li><strong>title:</strong> Card title</li>
                        <li><strong>image:</strong> Hero image URL</li>
                        <li><strong>image_scaling:</strong> Image fit (cover/contain)</li>
                        <li><strong>link1_text, link1_url:</strong> Custom link 1</li>
                        <li><strong>link2_text, link2_url:</strong> Custom link 2</li>
                        <li><strong>link3_text, link3_url:</strong> Custom link 3</li>
                        <li><strong>upgrade_text, upgrade_url:</strong> Primary CTA</li>
                        <li><strong>demo_text, demo_url:</strong> Secondary CTA</li>
                    </ul>
                </div>
            </div>
            
            <div class="postbox">
                <h3 class="hndle"><span>SureMembers Integration</span></h3>
                <div class="inside">
                    <?php if (class_exists('SureMembers\\Inc\\Access_Groups')): ?>
                        <p style="color: green;">✓ SureMembers plugin is active</p>
                        <p>Access control features are available. Use the <code>access_group_ids</code> attribute to restrict content based on user groups.</p>
                    <?php else: ?>
                        <p style="color: orange;">⚠ SureMembers plugin not detected</p>
                        <p>Install and activate the SureMembers plugin to enable access control features. Without it, all content cards will be accessible to all users.</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.content-card-admin-wrapper {
    display: flex;
    gap: 20px;
    margin-top: 20px;
}

.content-card-admin-main {
    flex: 2;
}

.content-card-admin-sidebar {
    flex: 1;
    max-width: 300px;
}

.content-card-admin-sidebar .postbox {
    margin-bottom: 20px;
}

.content-card-admin-sidebar .inside {
    padding: 12px;
}

.content-card-admin-sidebar h4 {
    margin-top: 0;
    margin-bottom: 10px;
}

.content-card-admin-sidebar pre {
    background: #f1f1f1;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
}

.content-card-admin-sidebar ul {
    margin-left: 20px;
}

.content-card-admin-sidebar li {
    margin-bottom: 5px;
    font-size: 13px;
}

@media (max-width: 1200px) {
    .content-card-admin-wrapper {
        flex-direction: column;
    }
    
    .content-card-admin-sidebar {
        max-width: none;
    }
}
</style>
