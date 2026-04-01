class CartUtils {
    static CART_KEY = 'hy_ui_cart';

    static getCart() {
        const cartStr = localStorage.getItem(this.CART_KEY);
        try {
            return cartStr ? JSON.parse(cartStr) : [];
        } catch (e) {
            return [];
        }
    }

    static saveCart(cart) {
        localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
        this.updateCartIconBadge();
    }

    static async addToCart(item) {
        let isApiSuccess = false;

        // Cập nhật API nếu đã đăng nhập
        if (window.AuthUtils && AuthUtils.isAuthenticated()) {
            const user = AuthUtils.getUser();
            try {
                const response = await fetch(`/api/cart`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        variantId: item.id || item.productId, // Use variantId if available, fallback to productId
                        quantity: item.quantity || 1
                    })
                });

                if (!response.ok) {
                    throw new Error('API Sync Failed');
                }
                isApiSuccess = true;
            } catch (error) {
                console.error('Lỗi khi lưu giỏ hàng vào Backend:', error);
                if (window.Toast) {
                    Toast.error('Chưa thể đồng bộ Giỏ hàng với máy chủ.');
                } else {
                    alert('Lỗi kết nối máy chủ!');
                }
                return; // Stop local save if API failed ensuring data consistency
            }
        }

        const cart = this.getCart();
        const existingItem = cart.find(c => c.id === item.id);
        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            cart.push({ ...item, quantity: item.quantity || 1 });
        }
        
        this.saveCart(cart);
        
        // Open mini cart instead of showing Toast if available
        if (typeof MiniCart !== 'undefined') {
            MiniCart.open();
        } else {
            const msg = isApiSuccess ? 'Đã đồng bộ sản phẩm vào Giỏ hàng' : 'Đã thêm sản phẩm vào giỏ hàng';
            if (window.Toast) {
                Toast.success(msg);
            } else if (window.ToastUtils && typeof window.ToastUtils.show === 'function') {
                window.ToastUtils.show(msg, 'success');
            } else {
                alert(msg);
            }
        }
    }

    static saveCartLocallyOnly(cart) {
        localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    }

    static updateCartIconBadge() {
        const cart = this.getCart();
        const totalCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
        
        const badge = document.getElementById('header-cart-count');
        if (badge) {
            badge.textContent = totalCount;
            if (totalCount > 0) {
                badge.classList.remove('hidden');
                badge.style.display = 'flex';
            } else {
                badge.classList.add('hidden');
                badge.style.display = 'none';
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    CartUtils.updateCartIconBadge();
});
