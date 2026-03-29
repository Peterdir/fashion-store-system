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

    function renderCartPage() {
        if (typeof CartUtils === 'undefined') return;
        const cart = CartUtils.getCart();

        if (cart.length === 0) {
            itemsContainer.classList.add('hidden');
            summaryCard.classList.add('hidden');
            emptyStateEl.classList.remove('hidden');
            if (loadingEl) loadingEl.classList.add('hidden');
            return;
        }

        // Determine unique shops (Mocked as standard 'Dazy Official' for now)
        // Grouping logic can be added later, currently a single list
        
        let html = '';
        let totalItems = 0;
        let subtotal = 0;
        let discountTotal = 0; // Mock discount if oldPrice/discount exists. Since UI Cart doesn't store oldPrice, we use 0 or calculate.

        cart.forEach((item, index) => {
            totalItems += item.quantity;
            subtotal += item.price * item.quantity;
            
            // Mock discount logic
            let discount = 0;
            let oldPriceDisplay = '';
            
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
                                <input type="checkbox" checked class="item-checkbox w-4 h-4 border border-outline text-primary focus:ring-0 no-radius cursor-pointer"/>
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
                                        <button class="hover:text-primary transition-colors"><span class="material-symbols-outlined text-xl">favorite</span></button>
                                        <button class="hover:text-secondary transition-colors" onclick="CartPage.removeItem('${item.id}')"><span class="material-symbols-outlined text-xl">delete</span></button>
                                    </div>
                                </div>
                                <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.1em]">ProductId: ${item.productId || item.id}</p>
                                
                                <div class="flex gap-3 pt-2">
                                    ${item.color !== 'N/A' ? `
                                    <div class="border border-outline/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer bg-white hover:border-primary transition-colors">
                                        MÀU: <span>${item.color}</span>
                                    </div>` : ''}
                                    ${item.size !== 'N/A' ? `
                                    <div class="border border-outline/10 px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer bg-white hover:border-primary transition-colors">
                                        CỠ: <span>${item.size}</span>
                                    </div>` : ''}
                                </div>
                            </div>

                            <div class="flex justify-between items-end mt-8">
                                <div class="space-y-1">
                                    ${oldPriceDisplay}
                                    <div class="text-xl font-black text-secondary tracking-tighter">${formatVND(item.price)}</div>
                                </div>
                                
                                <div class="flex items-center border border-outline/20 bg-white">
                                    <button onclick="CartPage.updateQty('${item.id}', -1)" class="px-3 py-2 hover:bg-surface-low transition-colors">
                                        <span class="material-symbols-outlined text-sm font-bold">remove</span>
                                    </button>
                                    <span class="px-5 py-2 text-xs font-black border-x border-outline/20 min-w-[48px] text-center">${item.quantity}</span>
                                    <button onclick="CartPage.updateQty('${item.id}', 1)" class="px-3 py-2 hover:bg-surface-low transition-colors">
                                        <span class="material-symbols-outlined text-sm font-bold">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        itemsContainer.innerHTML = html;
        
        // Update Order Summary
        let grandTotal = subtotal - discountTotal;
        let points = Math.floor(grandTotal / 1000);

        summarySubtotal.innerText = formatVND(subtotal);
        summaryDiscount.innerText = '-' + formatVND(discountTotal);
        summaryGrandtotal.innerText = formatVND(grandTotal);
        summaryPoints.innerText = '+' + formatVND(points).replace('₫', ' pts');
        summaryCount.innerText = `${totalItems} Sản phẩm đã chọn`;

        // Mini preview images
        let imagesHtml = '';
        cart.slice(0, 3).forEach(imgItem => {
            imagesHtml += `<div class="w-10 h-14 bg-surface-low border border-white overflow-hidden shrink-0 relative z-0"><img src="${imgItem.image}" class="w-full h-full object-cover"></div>`;
        });
        if (cart.length > 3) {
            imagesHtml += `<div class="w-10 h-14 bg-surface border border-white shrink-0 flex items-center justify-center text-[8px] font-bold text-on-surface-variant relative z-10">+${cart.length - 3}</div>`;
        }
        summaryImages.innerHTML = imagesHtml;

        emptyStateEl.classList.add('hidden');
        if (loadingEl) loadingEl.classList.add('hidden');
        itemsContainer.classList.remove('hidden');
        summaryCard.classList.remove('hidden');
    }

    // Expose functions to global for inline onclick handlers
    window.CartPage = {
        updateQty: function(id, change) {
            if (typeof CartUtils === 'undefined') return;
            let cart = CartUtils.getCart();
            const item = cart.find(c => c.id == id);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    this.removeItem(id);
                    return;
                }
                CartUtils.saveCartLocallyOnly(cart);
                renderCartPage();
                CartUtils.updateCartIconBadge();
                if (typeof MiniCart !== 'undefined') MiniCart.render(); // Keep in sync
            }
        },
        removeItem: function(id) {
            if (typeof CartUtils === 'undefined') return;
            let cart = CartUtils.getCart();
            cart = cart.filter(c => c.id != id);
            CartUtils.saveCartLocallyOnly(cart);
            renderCartPage();
            CartUtils.updateCartIconBadge();
            if (typeof MiniCart !== 'undefined') MiniCart.render(); // Keep in sync
        }
    };

    // Make checkout button work
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = '/checkout';
        });
    }

    // Initial render
    renderCartPage();

    // Setup an event listener if CartUtils triggers an update (optional sync between tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'hy_ui_cart') {
            renderCartPage();
        }
    });
});
