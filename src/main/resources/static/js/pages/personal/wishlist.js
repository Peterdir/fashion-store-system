/**
 * Wishlist Management for Personal Center
 */

Object.assign(PersonalCenter, {
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

        if (filterBtns.length === 0) return;

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
        if (typeof AuthUtils === 'undefined') return;
        const user = AuthUtils.getUser();
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
            const response = await fetch(`/api/wishlists`);
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
                    <p class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">${item.categoryName || 'General'}</p>
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
    }
});
