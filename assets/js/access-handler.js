/**
 * Content Card Access State Handler
 * 
 * Handles race conditions with login state and access level verification
 */
(function($) {
    'use strict';
    
    let accessCheckInProgress = false;
    let lastLoginState = contentCardAjax.isLoggedIn;
    let lastUserId = contentCardAjax.userId;
    
    /**
     * Check if access state has changed and refresh cards if needed
     */
    function checkAccessStateChange() {
        // Skip if already checking
        if (accessCheckInProgress) {
            return;
        }
        
        // Check if login state changed
        const currentLoginState = document.body.classList.contains('logged-in');
        const currentUserId = contentCardAjax.userId;
        
        if (currentLoginState !== lastLoginState || currentUserId !== lastUserId) {
            console.log('Content Card: Login state changed, refreshing access...');
            refreshAllCardAccess();
            lastLoginState = currentLoginState;
            lastUserId = currentUserId;
        }
    }
    
    /**
     * Refresh access state for all content cards on the page
     */
    function refreshAllCardAccess() {
        const cards = $('.content-card-container[data-access-groups]');
        
        if (cards.length === 0) {
            return;
        }
        
        accessCheckInProgress = true;
        
        cards.each(function() {
            const $card = $(this);
            const groupIds = $card.data('access-groups');
            
            // Skip cards with no access groups (public cards)
            if (!groupIds) {
                return;
            }
            
            // Add loading indicator
            $card.addClass('content-card-checking-access');
            
            refreshCardAccess($card, groupIds);
        });
    }
    
    /**
     * Refresh access state for a specific card
     */
    function refreshCardAccess($card, groupIds) {
        $.ajax({
            url: contentCardAjax.ajaxUrl,
            type: 'POST',
            data: {
                action: 'content_card_refresh_access',
                nonce: contentCardAjax.nonce,
                group_ids: groupIds
            },
            success: function(response) {
                if (response.success) {
                    const hasAccess = response.data.has_access;
                    const currentAccess = $card.data('has-access') === '1';
                    
                    // Update data attributes
                    $card.data('has-access', hasAccess ? '1' : '0');
                    $card.data('user-logged-in', response.data.is_logged_in ? '1' : '0');
                    
                    // If access state changed, reload the page to show correct content
                    if (hasAccess !== currentAccess) {
                        console.log('Content Card: Access state changed, reloading page...');
                        
                        // Add a small delay to prevent rapid reloads
                        setTimeout(function() {
                            window.location.reload();
                        }, 500);
                        return;
                    }
                }
                
                $card.removeClass('content-card-checking-access');
            },
            error: function() {
                console.log('Content Card: Access check failed for card');
                $card.removeClass('content-card-checking-access');
            },
            complete: function() {
                accessCheckInProgress = false;
            }
        });
    }
    
    /**
     * Initialize access state monitoring
     */
    function initAccessMonitoring() {
        // Check for access state changes periodically
        setInterval(checkAccessStateChange, 2000);
        
        // Check when page becomes visible (user switches back to tab)
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                setTimeout(checkAccessStateChange, 1000);
            }
        });
        
        // Check when user interacts with the page after being away
        let userAwayTime = Date.now();
        let checkOnReturn = false;
        
        document.addEventListener('blur', function() {
            userAwayTime = Date.now();
            checkOnReturn = true;
        });
        
        document.addEventListener('focus', function() {
            if (checkOnReturn && (Date.now() - userAwayTime) > 5000) {
                setTimeout(checkAccessStateChange, 1000);
                checkOnReturn = false;
            }
        });
        
        // Initial check after page load
        setTimeout(function() {
            const cards = $('.content-card-container[data-access-groups]');
            if (cards.length > 0) {
                console.log('Content Card: Initialized access monitoring for', cards.length, 'cards');
            }
        }, 1000);
    }
    
    // Initialize when document is ready
    $(document).ready(function() {
        initAccessMonitoring();
    });
    
    // Also initialize on window load as backup
    $(window).on('load', function() {
        setTimeout(initAccessMonitoring, 2000);
    });
    
})(jQuery);
