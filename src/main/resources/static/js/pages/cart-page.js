document.addEventListener('DOMContentLoaded', () => {
    const loadingEl = document.getElementById('cart-loading');
    const emptyStateEl = document.getElementById('cart-empty-state');
    const itemsContainer = document.getElementById('cart-items-container');
    const summaryCard = document.getElementById('order-summary-card');
    
    // Summary elements
    const summaryImages = document.getElementById('cart-summary-images');
    const summaryCount = document.getElementById('cart-summary-count');
    const summarySubtotal = document.getElementById('cart-summary-subtotal');
    const summaryGrandtotal = document.getElementById('cart-summary-grandtotal');
    const summaryDiscount = document.getElementById('cart-summary-discount');
    const summaryPoints = document.getElementById('cart-summary-points');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    function formatVND(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    }

    async function renderCartPage() {
        if (typeof CartUtils === 'undefined') return;
        const cart = CartUtils.getCart();

        if (cart.length === 0) {
            itemsContainer.classList.add('hidden');
            summaryCard.classList.add('hidden');
            emptyStateEl.classList.remove('hidden');
            if (loadingEl) loadingEl.classList.add('hidden');
            return;
        }

        // Lấy danh sách wishlist để hiển thị trạng thái trái tim đúng
        let wishlistProductIds = [];
        if (typeof AuthUtils !== 'undefined' && AuthUtils.isAuthenticated()) {
            try {
                const user = AuthUtils.getUser();
                const response = await fetch(`/api/wishlists`);
                if (response.ok) {
                    const wishItems = await response.json();
                    // Lưu cả productId và variantId tiềm năng để so khớp tốt nhất
                    wishlistProductIds = wishItems.map(wi => String(wi.productId));
                    console.log('User Wishlist IDs:', wishlistProductIds);
                }
            } catch (e) {
                console.error('Error fetching wish items for cart:', e);
            }
        }
        
        let html = '';
        cart.forEach((item, index) => {
            // Kiểm tra kỹ productId từ nhiều nguồn tiềm năng trong object item
            const pId = String(item.productId || item.variantId || item.id);
            const isWishlisted = wishlistProductIds.includes(pId);
            
            html += `
                <div class="p-8 border-b border-outline/5 last:border-0 group/item bg-white relative">
                    <!-- Shop Name -->
                    <div class="flex items-center gap-2 mb-6 opacity-60">
                        <span class="material-symbols-outlined text-sm">storefront</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest">Store Official</span>
                    </div>

                    <div class="flex flex-col md:flex-row gap-8">
                        <div class="flex gap-6">
                            <div class="flex items-start pt-2">
                                <input type="checkbox" checked data-id="${item.variantId || item.id}" value="${item.variantId || item.id}" class="item-checkbox w-4 h-4 border border-outline text-primary focus:ring-0 no-radius cursor-pointer"/>
                            </div>
                            <div class="w-32 h-44 bg-surface-low overflow-hidden shrink-0 border border-outline/5 relative group-hover/item:border-primary/20 transition-colors">
                                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-700">
                            </div>
                        </div>

                        <div class="flex-grow flex flex-col justify-between py-1">
                            <div class="space-y-4">
                                <div class="flex justify-between items-start gap-4">
                                    <h3 class="text-sm font-black leading-snug tracking-tight uppercase">${item.name}</h3>
                                    <div class="flex gap-4 text-on-surface-variant">
                                        <button onclick="CartPage.toggleWishlist('${item.productId || item.id}', this)" class="hover:text-primary transition-colors ${isWishlisted ? 'text-red-600' : ''}">
                                            <span class="material-symbols-outlined text-xl ${isWishlisted ? 'fill-1' : ''}" style="${isWishlisted ? 'font-variation-settings: \'FILL\' 1;' : ''}">favorite</span>
                                        </button>
                                        <button class="hover:text-secondary transition-colors" onclick="CartPage.removeItem('${item.id}')"><span class="material-symbols-outlined text-xl">delete</span></button>
                                    </div>
                                </div>
                                <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.1em]">SKU: ${item.id}</p>
                                
                                <div class="flex gap-3 pt-2">
                                    ${item.color !== 'N/A' ? `<div class="bg-surface-low px-3 py-1 text-[8.5px] font-black uppercase tracking-widest text-on-surface-variant/70">${item.color}</div>` : ''}
                                    ${item.size !== 'N/A' ? `<div class="bg-surface-low px-3 py-1 text-[8.5px] font-black uppercase tracking-widest text-on-surface-variant/70">${item.size}</div>` : ''}
                                </div>
                            </div>

                            <div class="flex justify-between items-end mt-8">
                                <div class="space-y-1">
                                    <div class="text-xl font-black text-secondary tracking-tighter">${formatVND(item.price)}</div>
                                </div>
                                
                                <!-- Elite Quantity Selector -->
                                <div class="relative">
                                    <div class="elite-qty-btn flex items-center justify-between gap-4 px-4 h-10 rounded-full cursor-pointer min-w-[100px]"
                                         onclick="event.stopPropagation(); CartPage.toggleQtyPopover('${item.id}')">
                                        <span class="text-[11px] font-black tracking-widest uppercase opacity-40">Qty</span>
                                        <span class="text-xs font-black" id="qty-val-${item.id}">${item.quantity}</span>
                                        <span class="material-symbols-outlined text-sm opacity-40">expand_more</span>
                                    </div>
                                    
                                    <!-- Popover Menu -->
                                    <div id="qty-popover-${item.id}" class="qty-popover" onclick="event.stopPropagation()">
                                        <div class="grid grid-cols-2 gap-2">
                                            <div class="qty-opt" onclick="CartPage.selectQty('${item.id}', 1)">01</div>
                                            <div class="qty-opt" onclick="CartPage.selectQty('${item.id}', 2)">02</div>
                                            <div class="qty-opt" onclick="CartPage.selectQty('${item.id}', 3)">03</div>
                                            <div class="qty-opt" onclick="CartPage.selectQty('${item.id}', 5)">05</div>
                                            <div class="qty-opt" onclick="CartPage.selectQty('${item.id}', 10)">10</div>
                                            <div class="qty-opt" onclick="CartPage.selectQty('${item.id}', 20)">20</div>
                                        </div>
                                        <div class="mt-3 pt-3 border-t border-black/5">
                                            <input type="number" value="${item.quantity}" min="1" 
                                                   oninput="if(this.value.startsWith('0')) this.value = this.value.replace(/^0+/, '')"
                                                   onchange="CartPage.selectQty('${item.id}', this.value)"
                                                   placeholder="Khác..."
                                                   class="w-full h-8 text-center text-xs font-black border border-black/5 bg-transparent outline-none focus:border-primary transition-colors rounded-lg">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        itemsContainer.innerHTML = html;

        // Tính toán ban đầu
        updateSummaryCalculation();

        emptyStateEl.classList.add('hidden');
        if (loadingEl) loadingEl.classList.add('hidden');
        itemsContainer.classList.remove('hidden');
        summaryCard.classList.remove('hidden');
    }

    // Đóng tất cả popover khi click ra ngoài
    document.addEventListener('click', () => {
        document.querySelectorAll('.qty-popover').forEach(p => p.classList.remove('active'));
    });

    // Gắn sự kiện lắng nghe việc thay đổi checkbox một lần duy nhất (Event Delegation)
    if (itemsContainer) {
        itemsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('item-checkbox')) {
                updateSummaryCalculation();
            }
        });
    }

    function updateSummaryCalculation() {
        if (typeof CartUtils === 'undefined') return;
        const cart = CartUtils.getCart();
        const checkedBoxes = document.querySelectorAll('.item-checkbox:checked');
        
        let totalItems = 0;
        let subtotal = 0;
        let discountTotal = 0;
        let selectedItems = [];

        checkedBoxes.forEach(cb => {
            const itemId = cb.dataset.id;
            const item = cart.find(c => (c.variantId == itemId || c.id == itemId));
            if (item) {
                totalItems += item.quantity;
                subtotal += item.price * item.quantity;
                selectedItems.push(item);
            }
        });

        // Cập nhật giao diện
        let grandTotal = subtotal - discountTotal;

        summarySubtotal.innerText = formatVND(subtotal);
        summaryDiscount.innerText = '-' + formatVND(discountTotal);
        summaryGrandtotal.innerText = formatVND(grandTotal);
        summaryCount.innerText = `${totalItems} Sản phẩm đã chọn`;

        // Cập nhật lại hình ảnh preview (chỉ hiện sp được chọn)
        let imagesHtml = '';
        selectedItems.slice(0, 3).forEach(item => {
            imagesHtml += `<div class="w-10 h-14 bg-surface-low border border-white overflow-hidden shrink-0 relative z-0"><img src="${item.image}" class="w-full h-full object-cover"></div>`;
        });
        if (selectedItems.length > 3) {
            imagesHtml += `<div class="w-10 h-14 bg-surface border border-white shrink-0 flex items-center justify-center text-[8px] font-bold text-on-surface-variant relative z-10">+${selectedItems.length - 3}</div>`;
        }
        summaryImages.innerHTML = imagesHtml;

        // Disable nút thanh toán nếu không chọn sp nào
        checkoutBtn.disabled = selectedItems.length === 0;
        checkoutBtn.style.opacity = selectedItems.length === 0 ? '0.5' : '1';
    }

    // Expose functions to global for inline onclick handlers
    window.CartPage = {
        toggleQtyPopover: function(id) {
            const popover = document.getElementById(`qty-popover-${id}`);
            if (popover) {
                const isActive = popover.classList.contains('active');
                // Close all others
                document.querySelectorAll('.qty-popover').forEach(p => p.classList.remove('active'));
                if (!isActive) popover.classList.add('active');
            }
        },
        selectQty: function(id, val) {
            let quantity = parseInt(val);
            if (isNaN(quantity) || quantity < 1) quantity = 1;

            if (typeof CartUtils === 'undefined') return;
            let cart = CartUtils.getCart();
            const item = cart.find(c => c.id == id);
            if (item) {
                item.quantity = quantity;
                CartUtils.saveCartLocallyOnly(cart);
                renderCartPage();
                CartUtils.updateCartIconBadge();
                if (typeof MiniCart !== 'undefined') MiniCart.render();
            }
        },
        removeItem: function(id) {
            if (typeof CartUtils === 'undefined') return;
            let cart = CartUtils.getCart();
            cart = cart.filter(c => c.id != id);
            CartUtils.saveCartLocallyOnly(cart);
            renderCartPage();
            CartUtils.updateCartIconBadge();
            if (typeof MiniCart !== 'undefined') MiniCart.render();
        },
        toggleWishlist: async function(productId, btn) {
            if (typeof WishlistUtils === 'undefined') return;
            const result = await WishlistUtils.toggleWishlist(productId);
            if (result) {
                const icon = btn.querySelector('.material-symbols-outlined');
                if (result.wishlisted) {
                    btn.classList.add('text-red-600');
                    icon.classList.add('fill-1');
                    icon.style.fontVariationSettings = "'FILL' 1";
                } else {
                    btn.classList.remove('text-red-600');
                    icon.classList.remove('fill-1');
                    icon.style.fontVariationSettings = "'FILL' 0";
                }
            }
        }
    };

    // Make checkout button work
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked');
            const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.id);

            if (selectedIds.length === 0) {
                if (window.Toast) {
                    Toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
                } else {
                    alert('Vui lòng chọn ít nhất một sản phẩm!');
                }
                return;
            }

            // Lưu danh sách ID đã chọn
            localStorage.setItem('hy_checkout_ids', JSON.stringify(selectedIds));
            window.location.href = '/checkout';
        });
    }

    // Initial render
    renderCartPage();
    loadRecommendations();

    async function loadRecommendations() {
        const grid = document.getElementById('recommendations-grid');
        if (!grid) return;

        try {
            const response = await fetch('/api/products?size=4&sort=id,desc');
            if (!response.ok) return;

            const data = await response.json();
            const products = data.content || [];

            if (products.length === 0) {
                grid.parentElement.classList.add('hidden');
                return;
            }

            grid.innerHTML = products.map(p => `
                <div class="space-y-4 group cursor-pointer" onclick="window.location.href='/products/${p.productId}'">
                    <div class="aspect-[3/4] bg-surface-low relative overflow-hidden no-radius">
                        <img src="${p.primaryImageUrl || '/images/placeholder.png'}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                        <div class="absolute top-0 left-0 bg-primary text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Chi tiết</div>
                        ${p.status === 'NEW' ? '<div class="absolute top-2 right-2 bg-emerald-500 text-white text-[7px] font-bold px-1.5 py-0.5 uppercase italic">New</div>' : ''}
                    </div>
                    <div class="space-y-1">
                        <p class="text-[10px] font-black uppercase tracking-widest truncate">${p.name}</p>
                        <p class="text-xs font-black text-secondary tracking-tighter">${formatVND(p.minPrice || p.price)}</p>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading recommendations:', error);
            grid.parentElement.classList.add('hidden');
        }
    }

    // Setup an event listener if CartUtils triggers an update (optional sync between tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'hy_ui_cart') {
            renderCartPage();
        }
    });
});
