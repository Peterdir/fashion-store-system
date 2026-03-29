class MiniCart {
    static init() {
        this.backdrop = document.getElementById('mini-cart-backdrop');
        this.drawer = document.getElementById('mini-cart-drawer');
        this.closeBtns = [document.getElementById('close-mini-cart'), document.getElementById('close-mini-cart-empty')];
        this.itemsContainer = document.getElementById('mini-cart-items');
        this.emptyState = document.getElementById('mini-cart-empty');
        this.totalEl = document.getElementById('mini-cart-total');
        this.countEl = document.getElementById('mini-cart-count');

        if (!this.drawer) return;

        // Overlay click to close
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.close());
        }

        // Close button click
        this.closeBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', () => this.close());
        });
        
        // Setup header cart icon click
        const cartIcon = document.querySelector('a[href="/cart"]');
        if (cartIcon && !window.location.pathname.startsWith('/cart')) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        }
    }

    static open() {
        if (!this.drawer) return;
        this.render();
        this.backdrop.classList.remove('opacity-0', 'pointer-events-none');
        this.drawer.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    static close() {
        if (!this.drawer) return;
        this.backdrop.classList.add('opacity-0', 'pointer-events-none');
        this.drawer.classList.add('translate-x-full');
        document.body.style.overflow = '';
    }

    static render() {
        if (!this.itemsContainer) return;

        let cart = [];
        if (typeof CartUtils !== 'undefined') {
            cart = CartUtils.getCart();
        }

        if (cart.length === 0) {
            this.itemsContainer.classList.add('hidden');
            this.emptyState.classList.remove('hidden');
            this.emptyState.classList.add('flex');
            
            // Disable footer buttons
            const footerBtns = document.querySelectorAll('#mini-cart-drawer .grid a');
            footerBtns.forEach(btn => {
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.5';
            });
            this.totalEl.innerText = '0₫';
            this.countEl.innerText = '0';
            return;
        }

        this.itemsContainer.classList.remove('hidden');
        this.emptyState.classList.add('hidden');
        this.emptyState.classList.remove('flex');
        
        // Enable footer buttons
        const footerBtns = document.querySelectorAll('#mini-cart-drawer .grid a');
        footerBtns.forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        });

        const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
        this.countEl.innerText = totalItems;

        let html = '';
        let grandTotal = 0;

        cart.forEach(item => {
            grandTotal += item.price * item.quantity;
            let displayPrice = new Intl.NumberFormat('vi-VN').format(item.price) + '₫';
            
            html += `
                <div class="flex gap-4 group bg-white border border-outline/5 p-4 relative shadow-sm hover:border-primary/20 transition-colors">
                    <button class="absolute -top-2 -right-2 bg-white border border-outline/10 text-outline hover:text-secondary w-6 h-6 flex items-center justify-center rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300" onclick="MiniCart.removeItem('${item.id}')">
                        <span class="material-symbols-outlined text-[14px]">close</span>
                    </button>
                    <div class="w-20 h-28 bg-surface-low shrink-0 overflow-hidden no-radius">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                    </div>
                    <div class="flex flex-col justify-between py-1 flex-grow">
                        <div class="space-y-1">
                            <h3 class="text-[11px] font-black uppercase tracking-tight leading-snug line-clamp-2 pr-4">${item.name}</h3>
                            <p class="text-[10px] font-bold tracking-widest text-on-surface-variant/50 uppercase">
                                ${item.color !== 'N/A' ? item.color : ''} ${item.color !== 'N/A' && item.size !== 'N/A' ? '/' : ''} ${item.size !== 'N/A' ? item.size : ''}
                            </p>
                        </div>
                        <div class="flex items-end justify-between w-full mt-3">
                            <div class="flex items-center border border-outline/20 bg-surface-low">
                                <button onclick="MiniCart.updateQty('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center hover:bg-outline/10 text-on-surface transition-colors">
                                    <span class="material-symbols-outlined text-[14px]">remove</span>
                                </button>
                                <span class="text-[10px] font-black w-6 text-center">${item.quantity}</span>
                                <button onclick="MiniCart.updateQty('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center hover:bg-outline/10 text-on-surface transition-colors">
                                    <span class="material-symbols-outlined text-[14px]">add</span>
                                </button>
                            </div>
                            <span class="text-sm font-black text-secondary tracking-tighter">${displayPrice}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        this.itemsContainer.innerHTML = html;
        this.totalEl.innerText = new Intl.NumberFormat('vi-VN').format(grandTotal) + '₫';
    }

    static updateQty(id, change) {
        if (typeof CartUtils === 'undefined') return;
        let cart = CartUtils.getCart();
        const item = cart.find(c => c.id == id); // == for type coercion if id is numeric string
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeItem(id);
                return;
            }
            CartUtils.saveCartLocallyOnly(cart);
            this.render();
            CartUtils.updateCartIconBadge();
        }
    }

    static removeItem(id) {
        if (typeof CartUtils === 'undefined') return;
        let cart = CartUtils.getCart();
        cart = cart.filter(c => c.id != id);
        CartUtils.saveCartLocallyOnly(cart);
        this.render();
        CartUtils.updateCartIconBadge();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    MiniCart.init();
});
