=== Content Card Shortcode ===
Contributors: yourname
Tags: shortcode, card, content, suremembers, access-control
Requires at least: 5.0
Tested up to: 6.3
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

A lightweight WordPress plugin that renders customizable content cards with conditional overlay access control.

== Description ==

The Content Card Shortcode plugin allows you to create visually appealing, customizable content cards using a simple shortcode `[content_card]`. The plugin features:

* **Easy Integration**: Simple shortcode and Gutenberg block
* **SureMembers Integration**: Conditional access control based on user groups
* **Customizable Design**: Configurable colors, styling, and content
* **Responsive Layout**: Mobile-friendly card designs
* **Admin Settings**: Set default values and styling options

= Key Features =

* Shortcode: `[content_card]` for embedding cards
* Gutenberg block with visual editor
* Conditional overlay for access control
* Integration with SureMembers plugin
* Customizable call-to-action buttons
* Admin settings page for defaults
* Responsive and accessible design

= SureMembers Integration =

When the SureMembers plugin is active, you can use the `access_group_ids` attribute to restrict card content to specific user groups. Users without access will see an overlay with upgrade options.

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/content-card-shortcode/`
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Use the Settings > Content Card screen to configure default options
4. Add `[content_card]` shortcode to any post or page, or use the Gutenberg block

== Frequently Asked Questions ==

= How do I use the shortcode? =

Simply add `[content_card]` to any post or page. You can customize it with attributes:

`[content_card title="My Card" image="https://example.com/image.jpg" access_group_ids="1,2"]`

= Does it work without SureMembers? =

Yes! Without SureMembers, all cards will be publicly accessible. The access control features only work when SureMembers is active.

= Can I customize the styling? =

Yes, go to Settings > Content Card to customize colors, border radius, and default values.

= Is it mobile-friendly? =

Absolutely! The cards are fully responsive and work great on all device sizes.

== Screenshots ==

1. Content card with access overlay
2. Gutenberg block editor interface
3. Admin settings page
4. Mobile responsive design

== Changelog ==

= 1.0.0 =
* Initial release
* Shortcode functionality
* Gutenberg block
* SureMembers integration
* Admin settings page
* Responsive design

== Upgrade Notice ==

= 1.0.0 =
Initial release of the Content Card Shortcode plugin.
