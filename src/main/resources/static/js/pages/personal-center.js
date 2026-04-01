/**
 * Personal Center Page Logic - Main Coordinator
 * Handles tab switching, sidebar toggling, and UI interactions.
 */

const PersonalCenter = {
    /**
     * Initialize the page
     */
    init() {
        console.log('Personal Center initializing...');
        
        // Initialize Profile Module (loaded from personal/profile.js)
        if (this.loadUserData) {
            this.loadUserData().then(() => {
                console.log('User data loaded successfully');
                if (this.setupProfileEditing) this.setupProfileEditing();
                if (this.setupAddressEditing) this.setupAddressEditing();
                if (this.setupWishlistFilters) this.setupWishlistFilters();
                if (this.setupManageAccount) this.setupManageAccount();

                // Initialize Orders Module
                console.log('Checking OrderModule initialization conditions...');
                if (window.OrderModule && this.originalProfile) {
                    console.log('Initializing OrderModule');
                    window.OrderModule.init();
                    
                    const urlParams = new URLSearchParams(window.location.search);
                    const currentTab = urlParams.get('tab');
                    const currentStatus = urlParams.get('status') || 'all';
                    if (currentTab === 'orders' || !currentTab) { // Load orders if tab is orders or on dashboard
                        window.OrderModule.loadOrders(currentStatus);
                    }
                } else {
                    console.warn('OrderModule skipped. Condition failed:', {
                        moduleFound: !!window.OrderModule,
                        profileFound: !!this.originalProfile
                    });
                }
            }).catch(err => {
                console.error('Initial loadUserData failed:', err);
            });
        }
        
        // Phân tích tham số 'tab' từ URL để mở đúng tab được yêu cầu
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab') || 'dashboard';
        
        this.switchTab(tab);
        this.setupEventListeners();

        // Nếu là tab yêu thích, tải dữ liệu ngay
        if (tab === 'favorites' && this.loadWishlist) {
            this.loadWishlist();
        }
    },

    /**
     * Helper to set element text safely
     */
    setElementText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    /**
     * Setup any additional event listeners
     */
    setupEventListeners() {
        // Handle Sidebar Menu Toggling
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

                // 3. Delegation cho OrderModule xử lý hiển thị Loading và Logic Load
                // Logic click đã được orders.js tự bắt thông qua setupListeners(), không cần gọi ở đây nữa.
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

                // 2. Real Loading from Backend
                if (wishlistContentArea && wishlistLoadingArea && this.loadWishlist) {
                    this.loadWishlist();
                }
            });
        });
    },

    /**
     * Toggle visibility of sub-menus
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
     * Switch between different content tabs
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
            target.style.animation = 'none';
            target.offsetHeight; // trigger reflow
            target.style.animation = '';

            // Load data if needed (if method exists)
            if (tabId === 'favorites' && this.loadWishlist) {
                this.loadWishlist();
            }
            if (tabId === 'coupons' && window.CouponModule) {
                window.CouponModule.init();
            }
            if (tabId === 'review-history' && window.OrderModule) {
                window.OrderModule.loadReviewHistory();
            }
            if (tabId === 'orders' && window.OrderModule) {
                const urlParams = new URLSearchParams(window.location.search);
                let status = urlParams.get('status') || 'all';

                if (clickedElement && clickedElement.hasAttribute('data-status')) {
                    status = clickedElement.getAttribute('data-status');
                    // Cập nhật lại URL ngầm định
                    const newUrl = new URL(window.location);
                    newUrl.searchParams.set('tab', 'orders');
                    newUrl.searchParams.set('status', status);
                    window.history.pushState({}, '', newUrl);
                }

                window.OrderModule.currentStatus = status;
                window.OrderModule.loadOrders(status);

                // Đồng bộ thanh order-subtabs hiển thị ngang
                const orderSubtabs = document.querySelectorAll('.order-subtab');
                orderSubtabs.forEach(s => {
                    if (s.getAttribute('data-status') === status) {
                        s.classList.add('text-primary', 'border-b-2', 'border-primary', 'font-black');
                        s.classList.remove('text-on-surface-variant/60', 'font-bold');
                    } else {
                        s.classList.remove('text-primary', 'border-b-2', 'border-primary', 'font-black');
                        s.classList.add('text-on-surface-variant/60', 'font-bold');
                    }
                });
            }
        } else {
            console.error('Target tab content not found: tab-' + tabId);
        }

        // 3. Update active state in the sidebar ONLY
        const sidebarLinks = document.querySelectorAll('aside .tab-link');
        const urlParams = new URLSearchParams(window.location.search);
        const urlStatus = urlParams.get('status');

        sidebarLinks.forEach(link => {
            const dataTab = link.getAttribute('data-tab');
            const dataStatus = link.getAttribute('data-status');
            
            let isActive = false;
            
            if (clickedElement) {
                isActive = (link === clickedElement);
                if (!isActive && !clickedElement.closest('aside')) {
                    if (dataTab === tabId) {
                        if (dataStatus) {
                            isActive = (dataStatus === 'all' || !urlStatus);
                        } else {
                            isActive = true;
                        }
                    }
                }
            } else {
                if (dataTab === tabId) {
                    if (dataStatus) {
                        isActive = urlStatus ? (dataStatus === urlStatus) : (dataStatus === 'all');
                    } else {
                        isActive = true;
                    }
                }
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

        // 5. Tự động bung menu cha nếu tab nằm trong menu con
        const activeLink = clickedElement || document.querySelector(`.tab-link[data-tab="${tabId}"]`);
        if (activeLink) {
            const parentSub = activeLink.closest('[id$="-sub"]');
            if (parentSub) {
                const subId = parentSub.id;
                const arrowId = subId.replace('-sub', '-arrow');
                this.toggleMenu(subId, arrowId, null, true);
            }
        }
    }
};

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    PersonalCenter.init();
});
