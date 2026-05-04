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
    let lastCheckTime = 0;
    let initComplete = false;
    let loginPollInterval = null;
    let reloadScheduled = false;
    
    /**
     * Return true if the WordPress logged-in cookie is present.
     * This cookie is NOT HttpOnly — WordPress intentionally leaves it
     * readable by JS for client-side login-state detection.
     */
    function hasWpLoginCookie() {
        return document.cookie.split(';').some(function(c) {
            return c.trim().indexOf('wordpress_logged_in_') === 0;
        });
    }
    
    /**
     * Reload the page once. Guards against double-fires from concurrent
     * ajaxSuccess events and the polling fallback both triggering.
     *
     * Uses fetch({ cache: 'reload' }) first to force the browser to send
     * Cache-Control: no-cache and get a fresh 200 from the server, updating
     * the cached entry. This prevents a 304 "not modified" response serving
     * the stale logged-out page when window.location.reload() fires.
     */
    function scheduleReload() {
        if (reloadScheduled) return;
        reloadScheduled = true;
        if (loginPollInterval) {
            clearInterval(loginPollInterval);
            loginPollInterval = null;
        }
        console.log('Content Card: Login detected, bypassing cache and reloading page...');
        setTimeout(function() {
            fetch(window.location.href, { cache: 'reload', credentials: 'same-origin' })
                .then(function() { window.location.reload(); })
                .catch(function() { window.location.reload(); });
        }, 300);
    }

    /**
     * Check if access state has changed and refresh cards if needed.
     * Only used for the "already logged in but SureMembers race" case.
     */
    function checkAccessStateChange() {
        // Skip if already checking or too soon since last check
        if (accessCheckInProgress || (Date.now() - lastCheckTime) < 10000) {
            return;
        }
        
        // Only check if we have cards that need access control
        const cards = $('.content-card-container[data-access-groups]');
        if (cards.length === 0) {
            return;
        }
        
        const currentLoginState = hasWpLoginCookie() || document.body.classList.contains('logged-in');
        const currentUserId = contentCardAjax.userId;
        
        if (currentLoginState !== lastLoginState || currentUserId !== lastUserId) {
            console.log('Content Card: Login state changed, refreshing access...');
            refreshAllCardAccess();
            lastLoginState = currentLoginState;
            lastUserId = currentUserId;
        }
        
        lastCheckTime = Date.now();
    }
    
    /**
     * Refresh access state for all content cards on the page
     */
    function refreshAllCardAccess() {
        const cards = $('.content-card-container[data-access-groups]');
        
        if (cards.length === 0 || accessCheckInProgress) {
            return;
        }
        
        accessCheckInProgress = true;
        let cardsToCheck = 0;
        let cardsChecked = 0;
        
        cards.each(function() {
            const $card = $(this);
            const groupIds = $card.data('access-groups');
            
            // Skip cards with no access groups (public cards)
            if (!groupIds) {
                return;
            }
            
            cardsToCheck++;
            
            // Add loading indicator
            $card.addClass('content-card-checking-access');
            
            refreshCardAccess($card, groupIds, function() {
                cardsChecked++;
                if (cardsChecked >= cardsToCheck) {
                    accessCheckInProgress = false;
                }
            });
        });
        
        // Failsafe to reset flag
        setTimeout(function() {
            accessCheckInProgress = false;
        }, 10000);
    }
    
    /**
     * Refresh access state for a specific card
     */
    function refreshCardAccess($card, groupIds, callback) {
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
                        }, 1000);
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
                if (callback) callback();
            }
        });
    }
    
    /**
     * Initialize access state monitoring
     */
    function initAccessMonitoring() {
        if (initComplete) {
            return;
        }
        
        initComplete = true;
        
        // On page load, if the user is already logged in and any cards are showing
        // as locked, do an immediate recheck. This fixes the race condition where
        // SureMembers hasn't fully loaded group memberships on the first page render
        // after login (e.g. after a password reset redirect).
        if (contentCardAjax.isLoggedIn) {
            var lockedCards = $('.content-card-container[data-access-groups][data-has-access="0"]');
            if (lockedCards.length > 0) {
                setTimeout(refreshAllCardAccess, 1500);
            }
        } else {
            // User is not logged in. Watch for a lightbox (e.g. UsersWP/UWP) login.
            //
            // Strategy: intercept jQuery's ajaxSuccess — fired immediately after the
            // browser applies the Set-Cookie headers from UWP's login AJAX response.
            // At that point hasWpLoginCookie() transitions from false → true.
            // We reload the whole page so PHP re-renders the tiles with correct access.
            //
            // The nonce in contentCardAjax was generated for a logged-out user so we
            // intentionally skip the AJAX re-check here and go straight to reload.
            var lockedCards = $('.content-card-container[data-access-groups][data-has-access="0"]');
            if (lockedCards.length > 0) {
                // Primary: react the instant UWP's AJAX login response is processed.
                $(document).ajaxSuccess(function() {
                    if (!reloadScheduled && hasWpLoginCookie()) {
                        scheduleReload();
                    }
                });
                
                // Fallback: poll every second in case the login came from a non-jQuery
                // request (fetch API, form POST in iframe, etc.).
                var pollStart = Date.now();
                loginPollInterval = setInterval(function() {
                    if (Date.now() - pollStart > 10 * 60 * 1000) {
                        clearInterval(loginPollInterval);
                        loginPollInterval = null;
                        return;
                    }
                    if (!reloadScheduled && hasWpLoginCookie()) {
                        scheduleReload();
                    }
                }, 1000);
            }
        }
        
        // Only check for access state changes every 30 seconds (much less frequent)
        setInterval(checkAccessStateChange, 30000);
        
        // Check when page becomes visible (user switches back to tab)
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                // Only check if user was away for more than 1 minute
                setTimeout(function() {
                    if ((Date.now() - lastCheckTime) > 60000) {
                        checkAccessStateChange();
                    }
                }, 2000);
            }
        });
        
        // Check when user interacts with the page after being away for a significant time
        let userAwayTime = Date.now();
        let checkOnReturn = false;
        
        document.addEventListener('blur', function() {
            userAwayTime = Date.now();
            checkOnReturn = true;
        });
        
        document.addEventListener('focus', function() {
            // Only check if user was away for more than 2 minutes
            if (checkOnReturn && (Date.now() - userAwayTime) > 120000) {
                setTimeout(checkAccessStateChange, 2000);
                checkOnReturn = false;
            }
        });
        
        // Initial setup message
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
    
})(jQuery);
