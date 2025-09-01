# Content Card Shortcode Plugin

A lightweight WordPress plugin that renders customizable content cards with conditional overlay access control using SureMembers integration.

## Features

- **Shortcode Support**: Use `[content_card]` shortcode to embed cards anywhere
- **Gutenberg Block**: Visual block editor with real-time preview
- **SureMembers Integration**: Conditional access control based on user groups
- **Customizable Styling**: Admin settings for colors, borders, and default values
- **Responsive Design**: Mobile-friendly card layouts
- **Accessibility**: ARIA labels and screen reader support

## Installation

1. Upload the plugin folder to your WordPress `wp-content/plugins/` directory
2. Activate the plugin through the WordPress admin panel
3. Configure default settings under Settings > Content Card

## Usage

### Shortcode
```
[content_card 
  title="My Custom Card"
  access_group_ids="1,2,3"
  image="https://example.com/image.jpg"
  upgrade_text="Get Access"
  upgrade_url="/upgrade"
]
```

### Gutenberg Block
Search for "Content Card" in the block editor and configure using the sidebar controls.

## Shortcode Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `access_group_ids` | Comma-separated SureMembers group IDs | '' |
| `title` | Card title | 'Content Card Title' |
| `image` | Hero image URL | Default image |
| `image_scaling` | Image fit (cover/contain) | 'cover' |
| `tool_url` | Plan Comparison Tool URL | '#' |
| `faq_url` | FAQ URL | '#' |
| `hints_url` | Helpful Hints URL | '#' |
| `link1_text` | Custom link 1 text | 'Plan Comparison Tool' |
| `link1_url` | Custom link 1 URL | Uses tool_url |
| `link2_text` | Custom link 2 text | 'PCT FAQ' |
| `link2_url` | Custom link 2 URL | Uses faq_url |
| `link3_text` | Custom link 3 text | 'PCT Helpful Hints' |
| `link3_url` | Custom link 3 URL | Uses hints_url |
| `upgrade_text` | Upgrade button text | 'Upgrade Now for Access' |
| `upgrade_url` | Upgrade button URL | '#' |
| `demo_text` | Demo button text | 'Schedule Demo' |
| `demo_url` | Demo button URL | '#' |

## Requirements

- WordPress 5.0 or later
- PHP 7.4 or later
- SureMembers plugin (optional, for access control)

## File Structure

```
content-card-shortcode.php          # Main plugin file
includes/
  class-content-card.php            # Shortcode handler
admin/
  class-content-card-admin.php      # Admin settings
  settings-page.php                 # Settings page template
assets/
  css/
    style.css                       # Frontend styles
    block.css                       # Block editor styles
  js/
    block.js                        # Gutenberg block
```

## License

GPL v2 or later
