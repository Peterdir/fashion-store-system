document.addEventListener('DOMContentLoaded', async () => {
    // 1. Kiểm tra đăng nhập
    if (typeof AuthUtils === 'undefined' || !AuthUtils.isAuthenticated()) {
        window.location.href = '/login?redirect=/checkout';
        return;
    }

    const user = AuthUtils.getUser();
    const itemsListEl = document.getElementById('checkout-items-list');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const grandtotalEl = document.getElementById('checkout-grandtotal');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const paymentOptions = document.querySelectorAll('.payment-option');
    
    let selectedMethod = 'MOMO'; // Mặc định MoMo
    let cartItems = [];

    // 2. Lấy dữ liệu giỏ hàng từ API (để đảm bảo có cartItemIds từ DB)
    async function loadCheckoutData() {
        try {
            const response = await fetch(`/api/cart?userId=${user.userId}`);
            if (response.ok) {
                const data = await response.json();
                cartItems = data.items || [];
                renderSummary(data);
            } else {
                if (window.Toast) Toast.error('Không thể tải dữ liệu giỏ hàng!');
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    function formatVND(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    }

    function renderSummary(data) {
        if (!cartItems.length) {
            itemsListEl.innerHTML = '<p class="text-[10px] font-bold opacity-40 uppercase text-center py-10">Giỏ hàng rỗng</p>';
            placeOrderBtn.disabled = true;
            return;
        }

        let html = '';
        cartItems.forEach(item => {
            html += `
                <div class="flex gap-4 group">
                    <div class="w-16 h-20 bg-surface-low shrink-0 border border-outline/5 overflow-hidden">
                        <img src="${item.image || '/images/placeholder.png'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    </div>
                    <div class="flex-grow flex flex-col justify-center">
                        <h4 class="text-[10px] font-black uppercase tracking-tight line-clamp-1">${item.productName}</h4>
                        <p class="text-[9px] font-bold opacity-40 uppercase mt-1">${item.color} / ${item.size}</p>
                        <div class="flex justify-between items-end mt-2">
                            <span class="text-[9px] font-black opacity-60">x ${item.quantity}</span>
                            <span class="text-xs font-black text-secondary">${formatVND(item.price * item.quantity)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        itemsListEl.innerHTML = html;
        subtotalEl.textContent = formatVND(data.totalAmount);
        grandtotalEl.textContent = formatVND(data.totalAmount);
    }

    // 3. Xử lý chọn phương thức thanh toán
    paymentOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            paymentOptions.forEach(p => p.classList.remove('selected'));
            opt.classList.add('selected');
            selectedMethod = opt.dataset.method;
        });
    });

    // Set mặc định cho MoMo
    document.querySelector('[data-method="MOMO"]').classList.add('selected');

    // 4. Đặt hàng
    placeOrderBtn.addEventListener('click', async () => {
        const fullName = document.getElementById('checkout-fullname').value.trim();
        const phone = document.getElementById('checkout-phone').value.trim();
        const address = document.getElementById('checkout-address').value.trim();

        if (!fullName || !phone || !address) {
            if (window.Toast) Toast.error('Vui lòng nhập đầy đủ thông tin giao hàng!');
            return;
        }

        const cartItemIds = cartItems.map(item => item.cartItemId);
        const orderData = {
            cartItemIds: cartItemIds,
            shippingAddress: `${fullName} | ${phone} | ${address}`,
            paymentMethod: selectedMethod,
            couponCode: null // Chưa tích hợp coupon ở bước này
        };

        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<span class="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></span> ĐANG XỬ LÝ...';

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (response.ok) {
                // Xóa giỏ hàng Local
                if (typeof CartUtils !== 'undefined') {
                    localStorage.removeItem(CartUtils.CART_KEY);
                    CartUtils.updateCartIconBadge();
                }

                if (selectedMethod === 'MOMO' && result.paymentUrl) {
                    // Chuyển hướng sang MoMo
                    window.location.href = result.paymentUrl;
                } else {
                    // COD thành công
                    if (window.Toast) Toast.success('Đặt hàng thành công!');
                    setTimeout(() => {
                        window.location.href = '/personal-center?tab=orders';
                    }, 1500);
                }
            } else {
                if (window.Toast) Toast.error(result.message || 'Có lỗi xảy ra khi đặt hàng!');
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'XÁC NHẬN ĐẶT HÀNG';
            }
        } catch (error) {
            console.error('Order error:', error);
            if (window.Toast) Toast.error('Lỗi kết nối máy chủ!');
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'XÁC NHẬN ĐẶT HÀNG';
        }
    });

    // Load dữ liệu ban đầu
    loadCheckoutData();
});
