(function() {
    const { registerBlockType } = wp.blocks;
    const { InspectorControls } = wp.blockEditor;
    const { 
        PanelBody, 
        TextControl, 
        SelectControl, 
        CheckboxControl,
        Button,
        ResponsiveWrapper
    } = wp.components;
    const { MediaUpload, MediaUploadCheck } = wp.blockEditor;
    const { useState, useEffect } = wp.element;
    const { __ } = wp.i18n;

    registerBlockType('content-card/card', {
        title: __('Content Card', 'content-card-shortcode'),
        icon: 'id-alt',
        category: 'design',
        keywords: ['card', 'content', 'tile', 'suremembers'],
        description: __('A customizable content card with conditional access control.', 'content-card-shortcode'),
        
        attributes: {
            title: {
                type: 'string',
                default: 'Content Card Title'
            },
            image: {
                type: 'string',
                default: 'https://testingillusions.com/wp-content/uploads/2025/08/compare-643305_640_1.png'
            },
            imageScaling: {
                type: 'string',
                default: 'cover'
            },
            accessGroupIds: {
                type: 'string',
                default: ''
            },
            link1Text: {
                type: 'string',
                default: 'Plan Comparison Tool'
            },
            link1Url: {
                type: 'string',
                default: '#'
            },
            link2Text: {
                type: 'string',
                default: 'PCT FAQ'
            },
            link2Url: {
                type: 'string',
                default: '#'
            },
            link3Text: {
                type: 'string',
                default: 'PCT Helpful Hints'
            },
            link3Url: {
                type: 'string',
                default: '#'
            },
            upgradeText: {
                type: 'string',
                default: 'Upgrade Now for Access'
            },
            upgradeUrl: {
                type: 'string',
                default: '#'
            },
            demoText: {
                type: 'string',
                default: 'Schedule Demo'
            },
            demoUrl: {
                type: 'string',
                default: '#'
            }
        },

        edit: function(props) {
            const { attributes, setAttributes } = props;
            const {
                title,
                image,
                imageScaling,
                accessGroupIds,
                link1Text,
                link1Url,
                link2Text,
                link2Url,
                link3Text,
                link3Url,
                upgradeText,
                upgradeUrl,
                demoText,
                demoUrl
            } = attributes;

            return [
                wp.element.createElement(InspectorControls, {},
                    wp.element.createElement(PanelBody, {
                        title: __('Card Content', 'content-card-shortcode'),
                        initialOpen: true
                    },
                        wp.element.createElement(TextControl, {
                            label: __('Title', 'content-card-shortcode'),
                            value: title,
                            onChange: (value) => setAttributes({ title: value })
                        }),
                        wp.element.createElement('div', { className: 'content-card-media-upload' },
                            wp.element.createElement('label', { className: 'components-base-control__label' }, __('Image', 'content-card-shortcode')),
                            wp.element.createElement(MediaUploadCheck, {},
                                wp.element.createElement(MediaUpload, {
                                    onSelect: (media) => setAttributes({ image: media.url }),
                                    allowedTypes: ['image'],
                                    value: image,
                                    render: ({ open }) => (
                                        image ? 
                                        wp.element.createElement('div', {},
                                            wp.element.createElement('img', {
                                                src: image,
                                                className: 'content-card-image-preview'
                                            }),
                                            wp.element.createElement(Button, {
                                                onClick: open,
                                                variant: 'secondary',
                                                size: 'small'
                                            }, __('Change Image', 'content-card-shortcode')),
                                            wp.element.createElement(Button, {
                                                onClick: () => setAttributes({ image: '' }),
                                                variant: 'link',
                                                isDestructive: true,
                                                size: 'small',
                                                className: 'content-card-remove-image'
                                            }, __('Remove', 'content-card-shortcode'))
                                        ) :
                                        wp.element.createElement(Button, {
                                            onClick: open,
                                            variant: 'primary'
                                        }, __('Select Image', 'content-card-shortcode'))
                                    )
                                })
                            )
                        ),
                        wp.element.createElement(SelectControl, {
                            label: __('Image Scaling', 'content-card-shortcode'),
                            value: imageScaling,
                            onChange: (value) => setAttributes({ imageScaling: value }),
                            options: [
                                { label: 'Cover (fill)', value: 'cover' },
                                { label: 'Contain (fit)', value: 'contain' }
                            ]
                        })
                    ),
                    
                    wp.element.createElement(PanelBody, {
                        title: __('Links', 'content-card-shortcode'),
                        initialOpen: false
                    },
                        wp.element.createElement(TextControl, {
                            label: __('Link 1 Text', 'content-card-shortcode'),
                            value: link1Text,
                            onChange: (value) => setAttributes({ link1Text: value })
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Link 1 URL', 'content-card-shortcode'),
                            value: link1Url,
                            onChange: (value) => setAttributes({ link1Url: value })
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Link 2 Text', 'content-card-shortcode'),
                            value: link2Text,
                            onChange: (value) => setAttributes({ link2Text: value })
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Link 2 URL', 'content-card-shortcode'),
                            value: link2Url,
                            onChange: (value) => setAttributes({ link2Url: value })
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Link 3 Text', 'content-card-shortcode'),
                            value: link3Text,
                            onChange: (value) => setAttributes({ link3Text: value })
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Link 3 URL', 'content-card-shortcode'),
                            value: link3Url,
                            onChange: (value) => setAttributes({ link3Url: value })
                        })
                    ),
                    
                    wp.element.createElement(PanelBody, {
                        title: __('Access Control', 'content-card-shortcode'),
                        initialOpen: false
                    },
                        wp.element.createElement(TextControl, {
                            label: __('Access Group IDs', 'content-card-shortcode'),
                            help: __('Comma-separated list of SureMembers group IDs. Leave empty for public access.', 'content-card-shortcode'),
                            value: accessGroupIds,
                            onChange: (value) => setAttributes({ accessGroupIds: value })
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Upgrade Button Text', 'content-card-shortcode'),
                            value: upgradeText,
                            onChange: (value) => setAttributes({ upgradeText: value })
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Upgrade URL', 'content-card-shortcode'),
                            value: upgradeUrl,
                            onChange: (value) => setAttributes({ upgradeUrl: value })
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Demo Button Text', 'content-card-shortcode'),
                            value: demoText,
                            onChange: (value) => setAttributes({ demoText: value })
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Demo URL', 'content-card-shortcode'),
                            value: demoUrl,
                            onChange: (value) => setAttributes({ demoUrl: value })
                        })
                    )
                ),

                wp.element.createElement('div', { className: 'content-card-block-preview' },
                    wp.element.createElement('h4', {}, __('Content Card Preview', 'content-card-shortcode')),
                    wp.element.createElement('p', {}, __('This is a preview of your content card. The actual styling will be applied on the frontend.', 'content-card-shortcode')),
                    wp.element.createElement('div', { 
                        style: { 
                            marginTop: '15px',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: '#fff'
                        }
                    },
                        wp.element.createElement('h5', { style: { margin: '0 0 10px 0' } }, title || 'Content Card Title'),
                        image && wp.element.createElement('div', {
                            style: {
                                width: '100%',
                                height: '100px',
                                background: `url(${image}) center/cover`,
                                borderRadius: '4px',
                                marginBottom: '10px'
                            }
                        }),
                        wp.element.createElement('div', {},
                            link1Text && wp.element.createElement('div', { style: { margin: '5px 0', fontSize: '12px' } }, '📎 ' + link1Text),
                            link2Text && wp.element.createElement('div', { style: { margin: '5px 0', fontSize: '12px' } }, '📎 ' + link2Text),
                            link3Text && wp.element.createElement('div', { style: { margin: '5px 0', fontSize: '12px' } }, '📎 ' + link3Text)
                        ),
                        accessGroupIds && wp.element.createElement('div', { 
                            style: { 
                                marginTop: '10px', 
                                padding: '5px', 
                                background: 'rgba(0,0,0,0.1)', 
                                borderRadius: '2px',
                                fontSize: '11px',
                                color: '#666'
                            } 
                        }, '🔒 Access restricted to groups: ' + accessGroupIds)
                    )
                )
            ];
        },

        save: function(props) {
            const { attributes } = props;
            
            // Build shortcode from attributes
            let shortcode = '[content_card';
            
            Object.keys(attributes).forEach(key => {
                if (attributes[key] && attributes[key] !== '') {
                    // Convert camelCase to snake_case for shortcode attributes
                    const attrName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                    shortcode += ` ${attrName}="${attributes[key]}"`;
                }
            });
            
            shortcode += ']';
            
            return wp.element.createElement('div', {
                className: 'wp-block-content-card-card'
            }, shortcode);
        }
    });
})();
