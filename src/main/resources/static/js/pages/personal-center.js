/**
 * Personal Center Page Logic
 * Handles tab switching, sidebar toggling, and UI interactions.
 */

const PersonalCenter = {
    /**
     * State for user profile
     */
    originalProfile: null,

    /**
     * Initialize the page
     */
    init() {
        console.log('Personal Center initializing...');
        this.loadUserData().then(() => {
             console.log('User data loaded successfully');
             this.setupProfileEditing();
             this.setupAddressEditing();
             this.setupWishlistFilters();
        }).catch(err => {
             console.error('Initial loadUserData failed:', err);
        });
        
        // Phân tích tham số 'tab' từ URL để mở đúng tab được yêu cầu
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab') || 'dashboard';
        
        this.switchTab(tab);
        this.setupEventListeners();

        // Nếu là tab yêu thích, tải dữ liệu ngay
        if (tab === 'favorites') {
            this.loadWishlist();
        }
    },

    /**
     * Load User Data from API and populate the UI
     */
    async loadUserData() {
        console.log('Attempting to fetch user profile from /api/users/me...');
        
        try {
            const response = await fetch('/api/users/me', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const profile = await response.json();
                this.originalProfile = profile; // Store original state for change detection
                
                // Đồng bộ hóa ngược lại AuthUtils/localStorage
                if (window.AuthUtils) {
                    const currentUser = AuthUtils.getUser() || {};
                    AuthUtils.saveUser({
                        ...currentUser,
                        userId: profile.userId,
                        fullName: profile.fullName,
                        email: profile.email,
                        role: profile.role
                    });
                    AuthUtils.updateHeaderUI();
                }

                this.populateUI(profile);
            } else {
                if (response.status === 401 || response.status === 403) {
                    if (window.AuthUtils) AuthUtils.removeUser();
                    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
                } else {
                    this.fallbackToLocalStorage();
                }
            }
        } catch (error) {
            console.error('Fetch error for user profile:', error);
            this.fallbackToLocalStorage();
        }
    },

    /**
     * Populate UI elements with profile data
     */
    populateUI(profile) {
        if (!profile) return;

        const formatName = (name) => {
            if (!name) return 'User';
            return name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        };

        const theName = formatName(profile.fullName);
        const theEmail = (profile.email || 'Not Set').toLowerCase();
        const thePhone = profile.phone || 'Not Set';
        const theAddress = profile.address || 'No address added yet';

        // Update elements
        this.setElementText('pc-profile-email', theEmail);
        this.setElementText('pc-profile-phone', thePhone);
        this.setElementText('pc-manage-email', theEmail);
        
        // Update Address Input
        const addressInput = document.getElementById('pc-address-input');
        if (addressInput) {
            addressInput.value = profile.address || '';
        }

        this.setElementText('pc-dashboard-name', theName);
        
        // Update Name Input
        const nameInput = document.getElementById('pc-profile-name-input');
        if (nameInput) {
            nameInput.value = profile.fullName || '';
        }

        // Cập nhật banner greeting
        const greetingContainer = document.getElementById('pc-dashboard-name-container');
        if (greetingContainer) {
            greetingContainer.innerHTML = `<span class="normal-case font-bold">Hi, ${theName}</span> <span class="bg-surface-low/50 text-[10px] font-black px-2 py-0.5 rounded border border-outline/10 text-on-surface-variant/40 flex items-center gap-1 normal-case"><span class="material-symbols-outlined text-[12px]">grade</span> S0 <span class="material-symbols-outlined text-[10px]">chevron_right</span></span>`;
        }
    },

    /**
     * Setup inline profile editing detection
     */
    setupProfileEditing() {
        const nameInput = document.getElementById('pc-profile-name-input');
        const saveContainer = document.getElementById('pc-save-btn-container');
        const saveBtn = document.getElementById('pc-save-profile-btn');

        if (!nameInput || !saveContainer || !saveBtn) return;

        // Detect input changes
        nameInput.addEventListener('input', () => {
            const currentValue = nameInput.value.trim();
            const originalValue = (this.originalProfile && this.originalProfile.fullName) || '';

            if (currentValue !== originalValue && currentValue.length >= 2) {
                saveContainer.classList.remove('hidden');
                saveContainer.classList.add('animate-in', 'fade-in', 'slide-in-from-top-2');
            } else {
                saveContainer.classList.add('hidden');
            }
        });

        // Handle save action
        saveBtn.addEventListener('click', () => this.saveProfile());
    },

    /**
     * Save profile changes to database
     */
    async saveProfile() {
        const nameInput = document.getElementById('pc-profile-name-input');
        if (!nameInput) return;

        const newName = nameInput.value.trim();
        if (newName.length < 2) {
            if (window.Toast) Toast.error('Họ tên phải có ít nhất 2 ký tự');
            return;
        }

        const saveBtn = document.getElementById('pc-save-profile-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[16px]">sync</span> Saving...`;

        try {
            // Chuẩn bị DTO (Giữ nguyên phone và address hiện tại)
            const updateData = {
                fullName: newName,
                phone: this.originalProfile ? this.originalProfile.phone : '',
                address: this.originalProfile ? this.originalProfile.address : ''
            };

            const response = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                this.originalProfile = updatedProfile;
                
                if (window.Toast) Toast.success('Update Success');
                
                // Cập nhật lại UI
                this.populateUI(updatedProfile);
                
                // Đồng bộ Header
                if (window.AuthUtils) {
                    const user = AuthUtils.getUser();
                    AuthUtils.saveUser({ ...user, fullName: updatedProfile.fullName });
                    AuthUtils.updateHeaderUI();
                }

                // Ẩn nút save
                document.getElementById('pc-save-btn-container').classList.add('hidden');
            } else {
                const err = await response.json();
                throw new Error(err.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Save profile error:', error);
            if (window.Toast) Toast.error(error.message || 'Lỗi kết nối máy chủ!');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    },

    /**
     * Setup address editing detection
     */
    setupAddressEditing() {
        const addressInput = document.getElementById('pc-address-input');
        const saveContainer = document.getElementById('pc-save-address-container');
        const saveBtn = document.getElementById('pc-save-address-btn');

        if (!addressInput || !saveContainer || !saveBtn) return;

        addressInput.addEventListener('input', () => {
            const currentValue = addressInput.value.trim();
            const originalValue = (this.originalProfile && this.originalProfile.address) || '';

            if (currentValue !== originalValue) {
                saveContainer.classList.remove('hidden');
                saveContainer.classList.add('animate-in', 'fade-in', 'slide-in-from-top-2');
            } else {
                saveContainer.classList.add('hidden');
            }
        });

        saveBtn.addEventListener('click', () => this.saveAddress());
    },

    /**
     * Save address changes to database
     */
    async saveAddress() {
        const addressInput = document.getElementById('pc-address-input');
        if (!addressInput) return;

        const newAddress = addressInput.value.trim();
        const saveBtn = document.getElementById('pc-save-address-btn');
        const originalText = saveBtn.innerHTML;
        
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[16px]">sync</span> Saving...`;

        try {
            const updateData = {
                fullName: this.originalProfile ? this.originalProfile.fullName : '',
                phone: this.originalProfile ? this.originalProfile.phone : '',
                address: newAddress
            };

            const response = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                this.originalProfile = updatedProfile;
                
                if (window.Toast) Toast.success('Address Updated');
                
                // Hide save button
                document.getElementById('pc-save-address-container').classList.add('hidden');
            } else {
                const err = await response.json();
                throw new Error(err.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Save address error:', error);
            if (window.Toast) Toast.error(error.message || 'Lỗi kết nối máy chủ!');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    },

    /**
     * Fallback to local storage if API is unreachable
     */
    fallbackToLocalStorage() {
        if (window.AuthUtils) {
            const user = AuthUtils.getUser();
            if (user) {
                console.log('Falling back to localStorage data');
                this.populateUI({
                    fullName: user.fullName,
                    email: user.email,
                    phone: 'Not Set', // localStorage usually doesn't have phone/address
                    address: null
                });
            }
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

                // 2. Real Loading from Backend
                if (wishlistContentArea && wishlistLoadingArea) {
                    this.loadWishlist();
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
        const emptyState = document.getElementById('wishlist-empty-state');
        const contentArea = document.getElementById('wishlist-content-area');
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

        // Toggle Empty State if needed
        if (emptyState) {
            if (visibleCount === 0) {
                emptyState.classList.remove('hidden');
                if (items.length > 0) {
                    emptyState.querySelector('p').textContent = 'No items match your filters.';
                } else {
                    emptyState.querySelector('p').textContent = 'It is empty here :-(';
                }
            } else {
                emptyState.classList.add('hidden');
            }
        }
    },

    /**
     * Load Wishlist Items from Backend
     */
    async loadWishlist() {
        const user = typeof AuthUtils !== 'undefined' ? AuthUtils.getUser() : null;
        const wishlistContentArea = document.getElementById('wishlist-content-area');
        const wishlistLoadingArea = document.getElementById('wishlist-loading');
        const wishlistEmptyState = document.getElementById('wishlist-empty-state');

        if (!user) {
            if (wishlistContentArea) wishlistContentArea.classList.add('hidden');
            if (wishlistEmptyState) wishlistEmptyState.classList.remove('hidden');
            return;
        }

        // Show loading
        if (wishlistContentArea) wishlistContentArea.classList.add('hidden');
        if (wishlistLoadingArea) wishlistLoadingArea.classList.remove('hidden');
        if (wishlistEmptyState) wishlistEmptyState.classList.add('hidden');

        try {
            const response = await fetch(`/api/wishlists?userId=${user.userId}`);
            if (response.ok) {
                const items = await response.json();
                this.renderWishlist(items);
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
            if (window.Toast) Toast.error('Lỗi tải danh sách yêu thích!');
        } finally {
            if (wishlistLoadingArea) wishlistLoadingArea.classList.add('hidden');
        }
    },

    /**
     * Render Wishlist Items
     */
    renderWishlist(items) {
        const wishlistContentArea = document.getElementById('wishlist-content-area');
        const wishlistEmptyState = document.getElementById('wishlist-empty-state');

        if (!wishlistContentArea) return;

        if (!items || items.length === 0) {
            wishlistContentArea.classList.add('hidden');
            if (wishlistEmptyState) {
                wishlistEmptyState.classList.remove('hidden');
                wishlistEmptyState.querySelector('p').textContent = 'It is empty here :-(';
            }
            return;
        }

        wishlistContentArea.classList.remove('hidden');
        if (wishlistEmptyState) wishlistEmptyState.classList.add('hidden');

        wishlistContentArea.innerHTML = items.map(item => `
            <div class="wishlist-item group cursor-pointer" 
                 data-category="${item.categoryName}" 
                 data-status="${item.inStock ? 'in-stock' : 'out-of-stock'}">
                <div class="relative aspect-[3/4] overflow-hidden bg-surface-low mb-4">
                    <img src="${item.primaryImageUrl || 'https://placehold.co/600x800?text=No+Image'}" 
                         alt="${item.productName}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    
                    <!-- Remove Button -->
                    <button class="absolute top-2 left-2 w-8 h-8 bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                            onclick="PersonalCenter.removeItemFromWishlist(${item.productId}, event)">
                        <span class="material-symbols-outlined text-[18px]">close</span>
                    </button>

                    <!-- Out of Stock Overlay -->
                    ${!item.inStock ? `
                    <div class="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span class="bg-black text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
                    </div>` : ''}

                    <!-- Social Proof Tag -->
                    <div class="absolute top-2 right-2 bg-white/80 backdrop-blur-md px-2 py-1 flex items-center gap-1.5 shadow-sm">
                        <span class="text-[9px] font-black tracking-tighter">Verified</span>
                        <span class="material-symbols-outlined text-[12px] text-secondary fill-[1]">favorite</span>
                    </div>

                    <!-- Quick Add Action -->
                    <div class="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
                        ${item.inStock ? `
                        <button onclick="CartUtils.addToCart({ id: ${item.productId}, productId: ${item.productId}, name: '${item.productName.replace(/'/g, "\\'")}', price: ${item.productPrice}, image: '${item.primaryImageUrl}', color: 'N/A', size: 'N/A', quantity: 1 }); event.preventDefault();"
                                class="w-full py-2 bg-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-secondary hover:text-white transition-colors">Add to Cart</button>
                        ` : `
                        <button class="w-full py-2 bg-black/20 text-white/40 cursor-not-allowed text-[10px] font-black uppercase tracking-[0.2em]" disabled>Add to Cart</button>
                        `}
                    </div>
                </div>
                <div class="space-y-1">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">${item.categoryName}</p>
                    <h3 class="text-xs font-black uppercase tracking-tight truncate">${item.productName}</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-black">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.productPrice)}</span>
                        ${!item.inStock ? '<span class="text-[9px] text-secondary font-black uppercase tracking-tighter">Temporarily unavailable</span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Re-apply filters if any
        this.filterWishlistItems();
    },

    /**
     * Remove Item from Wishlist
     */
    async removeItemFromWishlist(productId, event) {
        if (event) event.stopPropagation();
        if (typeof WishlistUtils !== 'undefined') {
            const result = await WishlistUtils.toggleWishlist(productId);
            if (result && !result.wishlisted) {
                this.loadWishlist(); // Reload the whole list
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

            // Load data if needed
            if (tabId === 'favorites') {
                this.loadWishlist();
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
                // Nếu được click trực tiếp, so sánh chính xác phần tử đó
                isActive = (link === clickedElement);
                
                // Trường hợp đặc biệt: Nếu click vào nút "My Profile" hoặc "Orders" ở Dashboard Card
                // thì chúng ta vẫn muốn highlight sidebar tương ứng
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
                // Load trang đầu tiên hoặc điều hướng từ Header
                if (dataTab === tabId) {
                    if (dataStatus) {
                        // Nếu là tab đơn hàng, khớp theo status
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
                // Force open the menu
                this.toggleMenu(subId, arrowId, null, true);
            }
        }
    },

    /**
     * State for Recently Viewed Selection
     */
    recentlyViewedSelectionMode: false,
    selectedRecentlyViewedIds: new Set(),

    /**
     * Toggle Selection Mode for Recently Viewed
     */
    toggleRecentlyViewedSelectionMode() {
        this.recentlyViewedSelectionMode = !this.recentlyViewedSelectionMode;
        
        const controls = document.getElementById('selection-controls');
        const btnText = document.getElementById('select-btn-text');
        const btnIcon = document.getElementById('select-btn-icon');
        const overlays = document.querySelectorAll('.selection-overlay');
        const selectAllCheckbox = document.getElementById('select-all-recently-viewed');

        if (this.recentlyViewedSelectionMode) {
            // Enable Mode
            controls.classList.remove('hidden');
            btnText.textContent = 'Cancel';
            btnIcon.textContent = 'close';
            overlays.forEach(el => {
                el.classList.remove('opacity-0', 'pointer-events-none');
                el.classList.add('opacity-100');
            });
        } else {
            // Disable Mode
            controls.classList.add('hidden');
            btnText.textContent = 'Select';
            btnIcon.textContent = 'rule';
            overlays.forEach(el => {
                el.classList.add('opacity-0', 'pointer-events-none');
                el.classList.remove('opacity-100');
            });
            
            // Reset state
            this.selectedRecentlyViewedIds.clear();
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            document.querySelectorAll('.item-checkbox').forEach(cb => cb.checked = false);
            this.updateDeleteButtonState();
        }
    },

    /**
     * Select All / Deselect All
     */
    toggleSelectAllRecentlyViewed(checked) {
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = checked;
            const productId = parseInt(cb.closest('.recently-viewed-item').dataset.productId);
            if (checked) {
                this.selectedRecentlyViewedIds.add(productId);
            } else {
                this.selectedRecentlyViewedIds.delete(productId);
            }
        });
        this.updateDeleteButtonState();
    },

    /**
     * Individual selection change
     */
    onRecentlyViewedSelectionChange(productId) {
        const item = document.querySelector(`.recently-viewed-item[data-product-id="${productId}"]`);
        const cb = item.querySelector('.item-checkbox');
        
        if (cb.checked) {
            this.selectedRecentlyViewedIds.add(productId);
        } else {
            this.selectedRecentlyViewedIds.delete(productId);
            // Uncheck "Select All" if one is unchecked
            const selectAll = document.getElementById('select-all-recently-viewed');
            if (selectAll) selectAll.checked = false;
        }
        this.updateDeleteButtonState();
    },

    /**
     * Update Delete Button Count and Disabled state
     */
    updateDeleteButtonState() {
        const btn = document.getElementById('delete-selected-btn');
        if (!btn) return;

        const count = this.selectedRecentlyViewedIds.size;
        btn.textContent = `Delete Selected (${count})`;
        btn.disabled = count === 0;
    },

    /**
     * Delete Selected Items from Backend
     */
    async deleteSelectedRecentlyViewed() {
        if (this.selectedRecentlyViewedIds.size === 0) return;

        const user = typeof AuthUtils !== 'undefined' ? AuthUtils.getUser() : null;
        if (!user) return;

        const productIds = Array.from(this.selectedRecentlyViewedIds).join(',');
        
        try {
            const response = await fetch(`/api/recently-viewed?userId=${user.userId}&productIds=${productIds}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove from DOM
                this.selectedRecentlyViewedIds.forEach(id => {
                    const el = document.querySelector(`.recently-viewed-item[data-product-id="${id}"]`);
                    if (el) {
                        el.style.transform = 'scale(0.8)';
                        el.style.opacity = '0';
                        setTimeout(() => el.remove(), 300);
                    }
                });

                if (window.Toast) Toast.success('Đã xóa sản phẩm khỏi lịch sử!');
                
                // Check if grid is empty after deletions
                setTimeout(() => {
                    const grid = document.getElementById('recently-viewed-grid');
                    if (grid && grid.children.length === 0) {
                        location.reload(); // Show empty state
                    }
                }, 400);

                this.toggleRecentlyViewedSelectionMode(); // Reset mode
            } else {
                if (window.Toast) Toast.error('Lỗi khi xóa sản phẩm!');
            }
        } catch (error) {
            console.error('Error deleting recently viewed items:', error);
            if (window.Toast) Toast.error('Đã xảy ra lỗi hệ thống!');
        }
    }
};

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    PersonalCenter.init();
});
