(function() {
    const { registerBlockType } = wp.blocks;
    const { InspectorControls } = wp.blockEditor;
    const { 
        PanelBody, 
        TextControl, 
        SelectControl, 
        CheckboxControl,
        Button,
        ResponsiveWrapper,
        Notice
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
                default: ''
            },
            link1Url: {
                type: 'string',
                default: ''
            },
            link2Text: {
                type: 'string',
                default: ''
            },
            link2Url: {
                type: 'string',
                default: ''
            },
            link3Text: {
                type: 'string',
                default: ''
            },
            link3Url: {
                type: 'string',
                default: ''
            },
            paragraphText: {
                type: 'string',
                default: ''
            },
            button1Text: {
                type: 'string',
                default: ''
            },
            button1Url: {
                type: 'string',
                default: ''
            },
            button2Text: {
                type: 'string',
                default: ''
            },
            button2Url: {
                type: 'string',
                default: ''
            },
            button3Text: {
                type: 'string',
                default: ''
            },
            button3Url: {
                type: 'string',
                default: ''
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
                paragraphText,
                button1Text,
                button1Url,
                button2Text,
                button2Url,
                button3Text,
                button3Url
            } = attributes;
            
            // State for preview toggle (unsubscribed vs subscribed view)
            const [showUnsubscribedView, setShowUnsubscribedView] = wp.element.useState(false);

            // Helper function to render group checkboxes
            const renderGroupCheckboxes = () => {
                const groups = contentCardData?.sureMembers?.groups || {};
                const isAvailable = contentCardData?.sureMembers?.available || false;
                
                if (!isAvailable) {
                    return wp.element.createElement(Notice, {
                        status: 'warning',
                        isDismissible: false
                    }, __('SureMembers plugin not detected. Access control will not work.', 'content-card-shortcode'));
                }
                
                if (Object.keys(groups).length === 0) {
                    return wp.element.createElement(Notice, {
                        status: 'info',
                        isDismissible: false
                    }, __('No access groups found. Create some access groups in SureMembers first.', 'content-card-shortcode'));
                }
                
                const selectedGroups = accessGroupIds ? accessGroupIds.split(',').map(id => id.trim()) : [];
                
                return Object.entries(groups).map(([id, name]) => 
                    wp.element.createElement(CheckboxControl, {
                        key: id,
                        label: name,
                        checked: selectedGroups.includes(id),
                        onChange: (checked) => {
                            let newSelectedGroups = [...selectedGroups];
                            if (checked) {
                                if (!newSelectedGroups.includes(id)) {
                                    newSelectedGroups.push(id);
                                }
                            } else {
                                newSelectedGroups = newSelectedGroups.filter(groupId => groupId !== id);
                            }
                            setAttributes({ accessGroupIds: newSelectedGroups.join(',') });
                        }
                    })
                );
            };

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
                        title: __('Additional Content', 'content-card-shortcode'),
                        initialOpen: false
                    },
                        wp.element.createElement(TextControl, {
                            label: __('Bottom Paragraph Text', 'content-card-shortcode'),
                            value: paragraphText,
                            onChange: (value) => setAttributes({ paragraphText: value }),
                            help: __('Optional centered text displayed at the bottom of the card.', 'content-card-shortcode')
                        })
                    ),
                    
                    wp.element.createElement(PanelBody, {
                        title: __('Access Control', 'content-card-shortcode'),
                        initialOpen: false
                    },
                        wp.element.createElement('div', {
                            style: { marginBottom: '16px' }
                        },
                            wp.element.createElement('label', {
                                style: { 
                                    display: 'block', 
                                    marginBottom: '8px', 
                                    fontWeight: '600',
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                    color: '#1e1e1e'
                                }
                            }, __('Access Groups', 'content-card-shortcode')),
                            wp.element.createElement('p', {
                                style: { 
                                    fontSize: '12px', 
                                    color: '#757575', 
                                    margin: '0 0 12px 0' 
                                }
                            }, __('Select which SureMembers access groups can view this content. Leave empty for public access.', 'content-card-shortcode')),
                            ...renderGroupCheckboxes()
                        ),
                        wp.element.createElement(TextControl, {
                            label: __('Button 1 Text', 'content-card-shortcode'),
                            value: button1Text,
                            onChange: (value) => setAttributes({ button1Text: value }),
                            help: __('Primary button (will be styled prominently)', 'content-card-shortcode')
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Button 1 URL', 'content-card-shortcode'),
                            value: button1Url,
                            onChange: (value) => setAttributes({ button1Url: value })
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Button 2 Text', 'content-card-shortcode'),
                            value: button2Text,
                            onChange: (value) => setAttributes({ button2Text: value }),
                            help: __('Secondary button', 'content-card-shortcode')
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Button 2 URL', 'content-card-shortcode'),
                            value: button2Url,
                            onChange: (value) => setAttributes({ button2Url: value })
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Button 3 Text', 'content-card-shortcode'),
                            value: button3Text,
                            onChange: (value) => setAttributes({ button3Text: value }),
                            help: __('Tertiary button (subtle styling)', 'content-card-shortcode')
                        }),
                        wp.element.createElement(TextControl, {
                            label: __('Button 3 URL', 'content-card-shortcode'),
                            value: button3Url,
                            onChange: (value) => setAttributes({ button3Url: value })
                        })
                    )
                ),

                    wp.element.createElement('div', { className: 'content-card-block-preview' },
                        wp.element.createElement('div', {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px',
                                position: 'relative',
                                zIndex: '20'
                            }
                        },
                            wp.element.createElement('h4', { 
                                style: { 
                                    margin: '0', 
                                    fontSize: '14px', 
                                    color: '#666', 
                                    fontWeight: '600' 
                                } 
                            }, __('Content Card Preview', 'content-card-shortcode')),
                            
                            // Preview toggle control
                            accessGroupIds && wp.element.createElement('div', {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '12px'
                                }
                            },
                                wp.element.createElement('span', {
                                    style: {
                                        fontSize: '11px',
                                        color: '#666'
                                    }
                                }, 'Preview as:'),
                                wp.element.createElement('button', {
                                    type: 'button',
                                    onClick: () => setShowUnsubscribedView(false),
                                    style: {
                                        padding: '4px 8px',
                                        fontSize: '10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        backgroundColor: !showUnsubscribedView ? '#D4A574' : 'white',
                                        color: !showUnsubscribedView ? 'white' : '#666',
                                        cursor: 'pointer',
                                        fontWeight: !showUnsubscribedView ? '600' : 'normal'
                                    }
                                }, 'Subscribed'),
                                wp.element.createElement('button', {
                                    type: 'button',
                                    onClick: () => setShowUnsubscribedView(true),
                                    style: {
                                        padding: '4px 8px',
                                        fontSize: '10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        backgroundColor: showUnsubscribedView ? '#D4A574' : 'white',
                                        color: showUnsubscribedView ? 'white' : '#666',
                                        cursor: 'pointer',
                                        fontWeight: showUnsubscribedView ? '600' : 'normal'
                                    }
                                }, 'Unsubscribed')
                            )
                        ),
                        wp.element.createElement('p', { 
                            style: { 
                                margin: '0 0 16px 0', 
                                fontSize: '12px', 
                                color: '#888', 
                                fontStyle: 'italic' 
                            } 
                        }, accessGroupIds && showUnsubscribedView ? 
                            __('Preview shows how unsubscribed users will see this content card.', 'content-card-shortcode') :
                            __('This preview shows how your card will appear on the frontend.', 'content-card-shortcode')),
                    
                    // Content Card Preview - matching actual design
                    wp.element.createElement('div', { 
                        style: { 
                            border: '1px solid #e8e8e8',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            background: '#fff',
                            maxWidth: '400px',
                            margin: '0 auto',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                        // Title spanning full width
                        wp.element.createElement('div', {
                            style: {
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#D4A574',
                                textAlign: 'center',
                                padding: '16px 16px 12px 16px',
                                borderBottom: '2px solid #f0f0f0',
                                background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                                letterSpacing: '0.5px'
                            }
                        }, title || 'Content Card Title'),
                        
                        // Body with image and content side by side
                        wp.element.createElement('div', {
                            style: {
                                display: 'flex',
                                minHeight: '200px'
                            }
                        },
                            // Image section
                            wp.element.createElement('div', {
                                style: {
                                    flex: '1',
                                    background: image ? 
                                        `url(${image}) center/cover` : 
                                        'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                    position: 'relative',
                                    minHeight: '200px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#888',
                                    fontSize: '12px'
                                }
                            }, !image && 'Image'),
                            
                            // Content section with links or upgrade buttons
                            wp.element.createElement('div', {
                                style: {
                                    flex: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    padding: '16px 0'
                                }
                            },
                                // Show different content based on preview toggle
                                (accessGroupIds && showUnsubscribedView) ? 
                                    // Upgrade/Demo buttons for unsubscribed view
                                    wp.element.createElement('div', {
                                        style: {
                                            padding: '20px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }
                                    },
                                        // First two buttons in a row
                                        wp.element.createElement('div', {
                                            style: {
                                                display: 'flex',
                                                gap: '12px',
                                                width: '100%',
                                                justifyContent: 'center',
                                                flexWrap: 'wrap'
                                            }
                                        },
                                            // Show only new button system
                                            (button1Text && button1Url) && wp.element.createElement('div', {
                                                style: {
                                                    backgroundColor: '#D4A574',
                                                    color: 'white',
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    flex: '1',
                                                    minWidth: '120px',
                                                    maxWidth: '140px'
                                                }
                                            }, button1Text),
                                            
                                            (button2Text && button2Url) && wp.element.createElement('div', {
                                                style: {
                                                    border: '2px solid #D4A574',
                                                    color: '#D4A574',
                                                    backgroundColor: 'transparent',
                                                    padding: '10px 16px',
                                                    borderRadius: '8px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    flex: '1',
                                                    minWidth: '120px',
                                                    maxWidth: '140px'
                                                }
                                            }, button2Text)
                                        ),
                                        
                                        // Third button centered below
                                        (button3Text && button3Url) && wp.element.createElement('div', {
                                            style: {
                                                border: '1px solid #ccc',
                                                color: '#666',
                                                backgroundColor: 'transparent',
                                                padding: '10px 20px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                marginTop: '8px',
                                                maxWidth: '180px'
                                            }
                                        }, button3Text),
                                        
                                        // Show message if no buttons are configured
                                        (!button1Text || !button1Url) && (!button2Text || !button2Url) && (!button3Text || !button3Url) && 
                                        wp.element.createElement('div', {
                                            style: {
                                                padding: '20px',
                                                textAlign: 'center',
                                                color: '#999',
                                                fontSize: '12px',
                                                fontStyle: 'italic'
                                            }
                                        }, 'No overlay buttons configured. Add button text and URLs in the Access Control section.')
                                    ) :
                                    // Regular links for subscribed view
                                    wp.element.createElement('div', {},
                                        (link1Text && link1Url) && wp.element.createElement('div', { 
                                            style: { 
                                                padding: '12px 20px',
                                                borderBottom: '1px solid #f5f5f5',
                                                fontSize: '14px',
                                                color: '#666',
                                                display: 'flex',
                                                alignItems: 'center'
                                            } 
                                        }, 
                                            wp.element.createElement('span', {
                                                style: { 
                                                    marginRight: '12px', 
                                                    color: '#D4A574', 
                                                    fontSize: '12px',
                                                    opacity: '0.7'
                                                }
                                            }, '▶'),
                                            link1Text
                                        ),
                                        (link2Text && link2Url) && wp.element.createElement('div', { 
                                            style: { 
                                                padding: '12px 20px',
                                                borderBottom: '1px solid #f5f5f5',
                                                fontSize: '14px',
                                                color: '#666',
                                                display: 'flex',
                                                alignItems: 'center'
                                            } 
                                        }, 
                                            wp.element.createElement('span', {
                                                style: { 
                                                    marginRight: '12px', 
                                                    color: '#D4A574', 
                                                    fontSize: '12px',
                                                    opacity: '0.7'
                                                }
                                            }, '▶'),
                                            link2Text
                                        ),
                                        (link3Text && link3Url) && wp.element.createElement('div', { 
                                            style: { 
                                                padding: '12px 20px',
                                                fontSize: '14px',
                                                color: '#666',
                                                display: 'flex',
                                                alignItems: 'center'
                                            } 
                                        }, 
                                            wp.element.createElement('span', {
                                                style: { 
                                                    marginRight: '12px', 
                                                    color: '#D4A574', 
                                                    fontSize: '12px',
                                                    opacity: '0.7'
                                                }
                                            }, '▶'),
                                            link3Text
                                        ),
                                        
                                        // Show message if no links are configured
                                        (!link1Text || !link1Url) && (!link2Text || !link2Url) && (!link3Text || !link3Url) && 
                                        wp.element.createElement('div', {
                                            style: {
                                                padding: '20px',
                                                textAlign: 'center',
                                                color: '#999',
                                                fontSize: '12px',
                                                fontStyle: 'italic'
                                            }
                                        }, 'No links configured. Add link text and URLs in the sidebar.')
                                    )
                            )
                        ),
                        
                        // Paragraph section at the bottom
                        paragraphText && wp.element.createElement('div', {
                            style: {
                                padding: '15px 20px',
                                background: '#f9f9f9',
                                borderTop: '1px solid #e8e8e8',
                                textAlign: 'center'
                            }
                        },
                            wp.element.createElement('p', {
                                style: {
                                    margin: '0',
                                    color: '#666',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    fontStyle: 'italic',
                                    fontWeight: 'bold'
                                }
                            }, paragraphText)
                        ),
                        
                        // Access restriction indicator - only show if preview toggle is on and groups are selected
                        (accessGroupIds && showUnsubscribedView) && wp.element.createElement('div', { 
                            style: { 
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                bottom: '0',
                                background: 'rgba(0, 0, 0, 0.4)',
                                backdropFilter: 'blur(2px)',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: '10',
                                padding: '20px'
                            } 
                        },
                            wp.element.createElement('div', {
                                style: {
                                    background: 'white',
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                                    textAlign: 'center',
                                    fontSize: '12px',
                                    color: '#333',
                                    marginBottom: '20px'
                                }
                            },
                                wp.element.createElement('div', {
                                    style: { fontWeight: '700', marginBottom: '4px' }
                                }, '🔒 Premium Content'),
                                wp.element.createElement('div', {
                                    style: { fontSize: '10px', color: '#666' }
                                }, accessGroupIds.split(',').length === 1 ? '1 access group' : accessGroupIds.split(',').length + ' access groups')
                            ),
                            
                            // Action buttons in overlay
                            wp.element.createElement('div', {
                                style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    width: '280px',
                                    maxWidth: '100%',
                                    justifyContent: 'center'
                                }
                            },
                                // First two buttons in a row
                                wp.element.createElement('div', {
                                    style: {
                                        display: 'flex',
                                        gap: '12px',
                                        width: '100%',
                                        justifyContent: 'center'
                                    }
                                },
                                    // Show only new button system
                                    (button1Text && button1Url) && wp.element.createElement('div', {
                                        style: {
                                            backgroundColor: '#D4A574',
                                            color: 'white',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)',
                                            transition: 'all 0.2s ease',
                                            flex: '1',
                                            minWidth: '120px',
                                            maxWidth: '140px'
                                        }
                                    }, button1Text),
                                    
                                    (button2Text && button2Url) && wp.element.createElement('div', {
                                        style: {
                                            border: '2px solid white',
                                            color: 'white',
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            backdropFilter: 'blur(10px)',
                                            transition: 'all 0.2s ease',
                                            flex: '1',
                                            minWidth: '120px',
                                            maxWidth: '140px'
                                        }
                                    }, button2Text)
                                ),
                                
                                // Third button centered below
                                (button3Text && button3Url) && wp.element.createElement('div', {
                                    style: {
                                        border: '1px solid rgba(255, 255, 255, 0.5)',
                                        color: 'white',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.2s ease',
                                        marginTop: '8px',
                                        maxWidth: '180px',
                                        width: '100%'
                                    }
                                }, button3Text)
                            )
                        )
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
