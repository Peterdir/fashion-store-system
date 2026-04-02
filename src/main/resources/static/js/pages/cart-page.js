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
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
    }

    async function renderCartPage() {
        if (typeof CartUtils === 'undefined') return;

        // Tự động đồng bộ giỏ hàng với máy chủ nếu người dùng đã đăng nhập (để lấy sp mua lại)
        if (typeof AuthUtils !== 'undefined' && AuthUtils.isAuthenticated()) {
            await CartUtils.syncWithServer();
        }

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
            const pId = String(item.productId || item.variantId || item.id);
            const isWishlisted = wishlistProductIds.includes(pId);
            
            html += `
                <div class="p-10 border-b border-outline/5 last:border-0 group/item bg-white relative transition-all hover:bg-neutral-50/50">
                    <div class="flex flex-col md:flex-row gap-10">
                        <!-- Checkbox & Image -->
                        <div class="flex gap-6 shrink-0">
                            <div class="flex items-start pt-2">
                                <input type="checkbox" checked data-id="${item.variantId || item.id}" value="${item.variantId || item.id}" 
                                       class="item-checkbox w-5 h-5 border-2 border-outline !rounded-none text-primary focus:ring-0 cursor-pointer"/>
                            </div>
                            <div class="w-36 h-48 bg-surface-low overflow-hidden shrink-0 border border-outline/5 relative shadow-sm group-hover/item:shadow-md transition-all duration-500 cursor-pointer"
                                 onclick="window.location.href='/product-detail/${item.productId || item.id}'">
                                 <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-1000">
                                 <div class="absolute inset-0 bg-black/0 group-hover/item:bg-black/5 transition-colors"></div>
                             </div>
                         </div>
 
                         <!-- Content Area -->
                         <div class="flex-grow flex flex-col justify-between">
                             <div class="space-y-6">
                                 <!-- Title & Basic Info -->
                                 <div class="flex justify-between items-start gap-6">
                                     <div class="space-y-1">
                                         <h3 class="text-base font-black leading-tight tracking-tighter uppercase mb-2 cursor-pointer hover:text-secondary transition-colors"
                                             onclick="window.location.href='/product-detail/${item.productId || item.id}'">${item.name}</h3>
                                     </div>
                                    <div class="flex gap-4">
                                        <button onclick="CartPage.toggleWishlist('${item.productId || item.id}', this)" 
                                                title="Lưu để mua sau"
                                                class="w-10 h-10 border border-outline/10 flex items-center justify-center hover:bg-white hover:text-secondary hover:border-secondary/20 transition-all ${isWishlisted ? 'text-secondary bg-white' : 'text-on-surface-variant'}">
                                            <span class="material-symbols-outlined text-xl ${isWishlisted ? 'fill-1' : ''}" style="${isWishlisted ? 'font-variation-settings: \'FILL\' 1;' : ''}">favorite</span>
                                        </button>
                                        <button class="w-10 h-10 border border-outline/10 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-on-surface-variant" 
                                                onclick="CartPage.removeItem('${item.id}')">
                                            <span class="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Detailed Specs Grid -->
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-black/5">
                                    <div>
                                        <p class="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Màu sắc</p>
                                        <p class="text-[10px] font-black uppercase tracking-widest">${item.color || 'Màu tiêu chuẩn'}</p>
                                    </div>
                                    <div>
                                        <p class="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Kích cỡ</p>
                                        <p class="text-[10px] font-black uppercase tracking-widest">${item.size || 'F'}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-between items-end mt-8">
                                <div class="flex items-baseline gap-3">
                                    <p class="text-[12px] font-bold text-neutral-900">${new Intl.NumberFormat('vi-VN').format(item.price)} VNĐ</p>
                                </div>
                                
                                <div class="relative">
                                    <div class="elite-qty-btn flex items-center justify-between gap-6 px-6 h-12 rounded-none border-2 border-black/5 hover:border-black cursor-pointer min-w-[120px] transition-all"
                                         onclick="event.stopPropagation(); CartPage.toggleQtyPopover('${item.id}')">
                                        <span class="text-[10px] font-black tracking-widest uppercase opacity-40">Qty</span>
                                        <span class="text-sm font-black" id="qty-val-${item.id}">${String(item.quantity).padStart(2, '0')}</span>
                                        <span class="material-symbols-outlined text-base opacity-40">unfold_more</span>
                                    </div>
                                    
                                    <div id="qty-popover-${item.id}" class="qty-popover !rounded-none !border-black" onclick="event.stopPropagation()">
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
                                                   class="w-full h-10 text-center text-[10px] font-black border border-black/10 bg-transparent outline-none focus:border-black transition-colors rounded-none">
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
                <div class="space-y-4 group cursor-pointer" onclick="window.location.href='/product-detail/${p.productId}'">
                    <div class="aspect-[3/4] bg-surface-low relative overflow-hidden no-radius">
                        <img src="${p.primaryImageUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22400%22 viewBox=%220 0 300 400%22%3E%3Crect width=%22300%22 height=%22400%22 fill=%22%23f3f4f6%22/%3E%3C/svg%3E'}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
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
