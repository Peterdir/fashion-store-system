/**
 * Personal Center Page Logic
 * Handles tab switching, sidebar toggling, and UI interactions.
 */

const PersonalCenter = {
    /**
     * Initialize the page
     */
    init() {
        console.log('Personal Center initialized');
        this.switchTab('dashboard');
        this.setupEventListeners();
        this.setupWishlistFilters();
    },

    /**
     * Setup any additional event listeners
     */
    setupEventListeners() {
        // Sidebar menus are now click-only per user request.
        // Hover listeners removed.

        // Handle Sidebar Menu Toggling (Click as fallback)
        const toggleButtons = document.querySelectorAll('.toggle-menu-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const arrowId = btn.getAttribute('data-arrow');
                this.toggleMenu(targetId, arrowId, btn);
            });
        });

        // Handle Tab Switching
        const tabLinks = document.querySelectorAll('.tab-link');
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = link.getAttribute('data-tab');
                if (tabId) {
                    this.switchTab(tabId, link);
                }
            });
        });

        // Handle Coupon Sub-tabs
        const couponSubtabs = document.querySelectorAll('.coupon-subtab');
        couponSubtabs.forEach(subtab => {
            subtab.addEventListener('click', () => {
                couponSubtabs.forEach(s => {
                    s.classList.remove('text-primary', 'border-b-2', 'border-primary');
                    s.classList.add('text-on-surface-variant/60', 'font-bold');
                    s.classList.remove('font-black');
                });
                subtab.classList.add('text-primary', 'border-b-2', 'border-primary', 'font-black');
                subtab.classList.remove('text-on-surface-variant/60', 'font-bold');
            });
        });

        // Handle Order Sub-tabs
        const orderSubtabs = document.querySelectorAll('.order-subtab');
        const orderContentArea = document.getElementById('order-tab-content-area');
        const orderLoadingArea = document.getElementById('order-loading');
        
        orderSubtabs.forEach(subtab => {
            subtab.addEventListener('click', () => {
                const status = subtab.getAttribute('data-status');

                // 1. Update internal sub-tabs UI
                orderSubtabs.forEach(s => {
                    s.classList.remove('text-primary', 'border-b-2', 'border-primary', 'font-black');
                    s.classList.add('text-on-surface-variant/60', 'font-bold');
                });
                subtab.classList.add('text-primary', 'border-b-2', 'border-primary', 'font-black');
                subtab.classList.remove('text-on-surface-variant/60', 'font-bold');

                // 2. Synchronize Sidebar Highlight
                if (status) {
                    const sidebarLinks = document.querySelectorAll('.tab-link[data-tab="orders"]');
                    sidebarLinks.forEach(link => {
                        const linkStatus = link.getAttribute('data-status');
                        if (linkStatus === status) {
                            link.classList.remove('text-on-surface-variant');
                            link.classList.add('text-secondary', 'translate-x-1');
                        } else {
                            link.classList.add('text-on-surface-variant');
                            link.classList.remove('text-secondary', 'translate-x-1');
                        }
                    });
                }

                // 3. Simulation: Staggered Loading
                if (orderContentArea && orderLoadingArea) {
                    orderContentArea.classList.add('hidden');
                    orderLoadingArea.classList.remove('hidden');
                    
                    const dots = [
                        document.getElementById('order-dot-1'),
                        document.getElementById('order-dot-2'),
                        document.getElementById('order-dot-3')
                    ];
                    
                    dots.forEach(dot => { if(dot) { dot.style.opacity = '1'; dot.style.transform = 'scale(1)'; }});

                    // Staggered disappearance
                    setTimeout(() => { if(dots[0]) dots[0].style.opacity = '0'; dots[0].style.transform = 'scale(0.5)'; }, 200);
                    setTimeout(() => { if(dots[1]) dots[1].style.opacity = '0'; dots[1].style.transform = 'scale(0.5)'; }, 350);
                    setTimeout(() => { 
                        if(dots[2]) { dots[2].style.opacity = '0'; dots[2].style.transform = 'scale(0.5)'; }
                        
                        orderLoadingArea.classList.add('hidden');
                        orderContentArea.classList.remove('hidden');
                        
                        // Trigger fade-in transition
                        orderContentArea.style.animation = 'none';
                        orderContentArea.offsetHeight; 
                        orderContentArea.style.animation = '';
                    }, 500);
                }
            });
        });

        // Handle Wishlist Sub-tabs
        const wishlistSubtabs = document.querySelectorAll('.wishlist-subtab');
        const wishlistContentArea = document.getElementById('wishlist-content-area');
        const wishlistLoadingArea = document.getElementById('wishlist-loading');
        
        wishlistSubtabs.forEach(subtab => {
            subtab.addEventListener('click', () => {
                // 1. Update internal sub-tabs UI
                wishlistSubtabs.forEach(s => {
                    s.classList.remove('text-primary', 'border-b-2', 'border-primary', 'font-black');
                    s.classList.add('text-on-surface-variant/40', 'font-bold');
                });
                subtab.classList.add('text-primary', 'border-b-2', 'border-primary', 'font-black');
                subtab.classList.remove('text-on-surface-variant/40', 'font-bold');

                // 2. Simulation: Staggered Loading
                if (wishlistContentArea && wishlistLoadingArea) {
                    wishlistContentArea.classList.add('hidden');
                    wishlistLoadingArea.classList.remove('hidden');
                    
                    const dots = [
                        document.getElementById('wishlist-dot-1'),
                        document.getElementById('wishlist-dot-2'),
                        document.getElementById('wishlist-dot-3')
                    ];
                    
                    dots.forEach(dot => { if(dot) { dot.style.opacity = '1'; dot.style.transform = 'scale(1)'; }});

                    // Staggered disappearance
                    setTimeout(() => { if(dots[0]) dots[0].style.opacity = '0'; dots[0].style.transform = 'scale(0.5)'; }, 200);
                    setTimeout(() => { if(dots[1]) dots[1].style.opacity = '0'; dots[1].style.transform = 'scale(0.5)'; }, 350);
                    setTimeout(() => { 
                        if(dots[2]) { dots[2].style.opacity = '0'; dots[2].style.transform = 'scale(0.5)'; }
                        
                        wishlistLoadingArea.classList.add('hidden');
                        wishlistContentArea.classList.remove('hidden');
                        
                        // Trigger fade-in transition
                        wishlistContentArea.style.animation = 'none';
                        wishlistContentArea.offsetHeight; 
                        wishlistContentArea.style.animation = '';
                    }, 500);
                }
            });
        });
    },

    /**
     * Toggle visibility of sub-menus
     * @param {string} id - The ID of the menu to toggle
     * @param {string|null} arrowId - The ID of the arrow icon to rotate
     * @param {HTMLElement|null} buttonElement - The button that triggered the toggle
     * @param {boolean|null} forceState - Force open (true) or closed (false)
     */
    toggleMenu(id, arrowId = null, buttonElement = null, forceState = null) {
        const menu = document.getElementById(id);
        const arrow = document.getElementById(arrowId);
        if (!menu) return;

        const shouldOpen = forceState !== null ? forceState : menu.classList.contains('hidden');

        if (shouldOpen) {
            menu.classList.remove('hidden');
            if (arrow) arrow.classList.add('rotate-180');
            if (buttonElement) {
                buttonElement.classList.add('text-secondary', 'translate-x-1');
            }
        } else {
            menu.classList.add('hidden');
            if (arrow) arrow.classList.remove('rotate-180');
            if (buttonElement) {
                buttonElement.classList.remove('text-secondary', 'translate-x-1');
            }
        }
    },

    /**
     * State for wishlist filtering
     */
    activeWishlistFilters: {
        category: 'all',
        status: 'all'
    },

    /**
     * Setup Wishlist Filtering Logic
     */
    setupWishlistFilters() {
        const filterBtns = document.querySelectorAll('.wishlist-filter-btn');
        const categoryLabel = document.getElementById('wishlist-category-label');
        const statusLabel = document.getElementById('wishlist-status-label');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-filter-type'); // 'category' or 'status'
                const value = btn.getAttribute('data-filter-value');

                // 1. Update active state
                this.activeWishlistFilters[type] = value;

                // 2. Update UI labels
                if (type === 'category' && categoryLabel) {
                    categoryLabel.textContent = value === 'all' ? 'Category' : value;
                } else if (type === 'status' && statusLabel) {
                    statusLabel.textContent = value === 'all' ? 'Status' : (value === 'in-stock' ? 'In Stock' : 'Out of Stock');
                }

                // 3. Perform filtering
                this.filterWishlistItems();

                // 4. Update dot indicators
                const sameTypeBtns = document.querySelectorAll(`.wishlist-filter-btn[data-filter-type="${type}"]`);
                sameTypeBtns.forEach(b => {
                    const dot = b.querySelector('span:first-child');
                    if (dot) {
                        dot.classList.remove('bg-secondary', 'border-secondary');
                        dot.classList.add('border-outline/20');
                    }
                });
                const currentDot = btn.querySelector('span:first-child');
                if (currentDot) {
                    currentDot.classList.add('bg-secondary', 'border-secondary');
                    currentDot.classList.remove('border-outline/20');
                }
            });
        });

        // Initialize default active dots (All Categories & All Status)
        document.querySelectorAll('.wishlist-filter-btn[data-filter-value="all"]').forEach(btn => {
            const dot = btn.querySelector('span:first-child');
            if (dot) {
                dot.classList.add('bg-secondary', 'border-secondary');
                dot.classList.remove('border-outline/20');
            }
        });
    },

    /**
     * Filter wishlist items based on current active filters
     */
    filterWishlistItems() {
        const items = document.querySelectorAll('.wishlist-item');
        const emptyState = document.querySelector('#tab-favorites .bg-white.p-20');
        let visibleCount = 0;

        items.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            const itemStatus = item.getAttribute('data-status');

            const matchCategory = this.activeWishlistFilters.category === 'all' || itemCategory === this.activeWishlistFilters.category;
            const matchStatus = this.activeWishlistFilters.status === 'all' || itemStatus === this.activeWishlistFilters.status;

            if (matchCategory && matchStatus) {
                item.classList.remove('hidden');
                visibleCount++;
            } else {
                item.classList.add('hidden');
            }
        });

        // Toggle Empty State if needed (only if products were rendered but now filtered out)
        // Note: This logic only applies if the server initially sent a non-empty list.
        if (items.length > 0 && emptyState) {
            if (visibleCount === 0) {
                emptyState.classList.remove('hidden');
                emptyState.querySelector('p').textContent = 'No items match your filters.';
            } else {
                emptyState.classList.add('hidden');
            }
        }
    },

    /**
     * Switch between different content tabs
     * @param {string} tabId - The ID of the tab to show (without 'tab-' prefix)
     * @param {HTMLElement|null} clickedElement - The element that triggered the switch
     */
    switchTab(tabId, clickedElement = null) {
        console.log('Executing switchTab for:', tabId);
        
        // 1. Hide all tab content sections
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.classList.add('hidden');
        });

        // 2. Show the selected tab content
        const target = document.getElementById('tab-' + tabId);
        if (target) {
            target.classList.remove('hidden');
            // Trigger animation
            target.style.animation = 'none';
            target.offsetHeight; // trigger reflow
            target.style.animation = '';
        } else {
            console.error('Target tab content not found: tab-' + tabId);
        }

        // 3. Update active state in the sidebar
        const links = document.querySelectorAll('.tab-link');
        links.forEach(link => {
            const dataTab = link.getAttribute('data-tab');
            
            // If we have a clicked element, only highlight THAT specific element
            // Otherwise (like on init), highlight all elements matching the tabId
            let isActive = false;
            if (clickedElement) {
                isActive = (link === clickedElement);
            } else {
                isActive = (dataTab === tabId);
            }

            if (isActive) {
                link.classList.remove('text-on-surface-variant');
                link.classList.add('text-secondary', 'translate-x-1');
            } else {
                link.classList.add('text-on-surface-variant');
                link.classList.remove('text-secondary', 'translate-x-1');
            }
        });

        // 4. Handle Synchronization (Sidebar -> Sub-tabs)
        if (tabId === 'orders' && clickedElement) {
            const status = clickedElement.getAttribute('data-status');
            if (status) {
                const subTabs = document.querySelectorAll('.order-subtab');
                subTabs.forEach(st => {
                    const stStatus = st.getAttribute('data-status');
                    if (stStatus === status) {
                        st.classList.add('text-primary', 'border-b-2', 'border-primary', 'font-black');
                        st.classList.remove('text-on-surface-variant/60', 'font-bold');
                    } else {
                        st.classList.remove('text-primary', 'border-b-2', 'border-primary', 'font-black');
                        st.classList.add('text-on-surface-variant/60', 'font-bold');
                    }
                });
            }
        }
    }
};

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    PersonalCenter.init();
});
