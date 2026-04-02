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
    let appliedCoupon = null;
    let discountAmount = 0;

    // 2. Lấy dữ liệu giỏ hàng từ API và lọc theo lựa chọn từ trang trước
    // 2. Lấy dữ liệu giỏ hàng (Ưu tiên API, Dự phòng Local)
    async function loadCheckoutData() {
        // Đọc các ID được chọn từ localStorage (từ trang cart-page.js)
        const selectedIdsJson = localStorage.getItem('hy_checkout_ids');
        let selectedIds = [];
        if (selectedIdsJson) {
            try { selectedIds = JSON.parse(selectedIdsJson).map(id => String(id)); } catch (e) { selectedIds = []; }
        }

        try {
            const response = await fetch(`/api/cart`);
            let allItems = [];
            
            if (response.ok) {
                const data = await response.json();
                allItems = data.items || [];
            }

            // FILTER LOGIC
            if (selectedIds.length > 0) {
                // Khớp sản phẩm từ API với các ID đã chọn ở trang trước
                cartItems = allItems.filter(item => selectedIds.includes(String(item.variantId)));
                
                // FALLBACK: Nếu API không trả về đúng sản phẩm cần (có thể chưa đồng bộ kịp), hãy lấy từ Local Cart
                if (cartItems.length === 0 && typeof CartUtils !== 'undefined') {
                    console.log('Checkout: UI Fallback to Local Storage due to empty API match');
                    const localCart = CartUtils.getCart();
                    cartItems = localCart.filter(item => selectedIds.includes(String(item.variantId || item.id)));
                }
            } else {
                // Nếu không có ID cụ thể, mặc định lấy toàn bộ giỏ hàng
                cartItems = allItems;
            }

            renderSummary();
        } catch (error) {
            console.error('Error loading checkout data:', error);
            // Cố gắng cứu vãn bằng dữ liệu cục bộ hoàn toàn nếu API lỗi
            if (typeof CartUtils !== 'undefined') {
                const localCart = CartUtils.getCart();
                cartItems = selectedIds.length > 0 ? localCart.filter(item => selectedIds.includes(String(item.variantId || item.id))) : localCart;
                renderSummary();
            }
        }
    }

    // 2.5 Lấy thông tin cá nhân để tự động điền form
    async function loadUserProfile() {
        // ... (giữ nguyên logic loadUserProfile cũ)
        const fields = ['checkout-fullname', 'checkout-phone', 'checkout-address'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.opacity = '0.5';
        });

        try {
            const response = await fetch('/api/users/me');
            if (response.ok) {
                const profile = await response.json();
                setTimeout(() => {
                    const fullnameEl = document.getElementById('checkout-fullname');
                    const phoneEl = document.getElementById('checkout-phone');
                    const addressEl = document.getElementById('checkout-address');

                    if (fullnameEl && profile.fullName) fullnameEl.value = profile.fullName;
                    if (phoneEl && profile.phone) phoneEl.value = profile.phone;
                    if (addressEl) {
                        if (profile.address) {
                            addressEl.value = profile.address;
                        } else if (profile.shippingAddress) {
                            addressEl.value = profile.shippingAddress;
                        }
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            fields.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.opacity = '1';
            });
        }
    }

    function formatVND(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
    }

    function renderSummary() {
        if (!cartItems || cartItems.length === 0) {
            itemsListEl.innerHTML = '<p class="text-[10px] font-bold opacity-40 uppercase text-center py-10">Giỏ hàng rỗng</p>';
            placeOrderBtn.disabled = true;
            return;
        }

        let html = '';
        let subtotal = 0;
        
        cartItems.forEach(item => {
            const imgSrc = item.primaryImageUrl || item.image || '/images/placeholder.png';
            const displayName = item.productName || item.name;
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            html += `
                <div class="flex gap-4 group">
                    <div class="w-16 h-20 bg-surface-low shrink-0 border border-outline/5 overflow-hidden">
                        <img src="${imgSrc}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    </div>
                    <div class="flex-grow flex flex-col justify-center">
                        <h4 class="text-[10px] font-black uppercase tracking-tight line-clamp-1">${displayName}</h4>
                        <p class="text-[9px] font-bold opacity-40 uppercase mt-1">${item.color} / ${item.size}</p>
                        <div class="flex justify-between items-end mt-2">
                            <span class="text-[9px] font-black opacity-60">x ${item.quantity}</span>
                            <span class="text-xs font-black text-secondary">${formatVND(itemTotal)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        itemsListEl.innerHTML = html;
        subtotalEl.textContent = formatVND(subtotal);
        
        // Kiểm tra xem có item nào bị thiếu ID máy chủ không (để cảnh báo lỗi 400 sớm)
        const hasInvalidItems = cartItems.some(item => !item.cartItemId);
        if (hasInvalidItems) {
            console.warn('Checkout: Phát hiện sản phẩm chưa đồng bộ với máy chủ!');
        }

        // Hiển thị giảm giá nếu có
        const couponRow = document.getElementById('checkout-coupon-row');
        const discountEl = document.getElementById('checkout-discount');
        
        if (discountAmount > 0) {
            couponRow.classList.remove('hidden');
            discountEl.textContent = '-' + formatVND(discountAmount);
        } else {
            couponRow.classList.add('hidden');
        }

        const grandTotal = Math.max(0, subtotal - discountAmount);
        grandtotalEl.textContent = formatVND(grandTotal);
        placeOrderBtn.disabled = false;
    }

    // Xử lý Coupon
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponInput = document.getElementById('coupon-input');
    const couponMessage = document.getElementById('coupon-message');

    function updateDiscountUI() {
        if (!appliedCoupon) {
            discountAmount = 0;
            return;
        }

        // Máy chủ đã tính toán sẵn số tiền giảm thực tế dựa trên loại mã (%) hoặc cố định
        discountAmount = appliedCoupon.discountValue;
        
        renderSummary();
    }

    function toggleCouponInputDisplay(isApplied) {
        const inputGroup = document.getElementById('coupon-input-group');
        const appliedTag = document.getElementById('applied-coupon-tag');
        const tagName = document.getElementById('applied-coupon-name');
        const tagDesc = document.getElementById('applied-coupon-description');

        if (isApplied && appliedCoupon) {
            if (inputGroup) inputGroup.classList.add('hidden');
            if (appliedTag) {
                appliedTag.classList.remove('hidden');
                appliedTag.classList.add('flex');
            }
            
            if (tagName) tagName.textContent = appliedCoupon.code;
            if (tagDesc) {
                const discountLabel = appliedCoupon.discountType === 'PERCENTAGE' 
                    ? `Giảm ${appliedCoupon.discountValue}%` 
                    : `Giảm ${formatVND(appliedCoupon.discountValue)}`;
                tagDesc.textContent = `Bạn đã được ${discountLabel}`;
            }
        } else {
            if (inputGroup) inputGroup.classList.remove('hidden');
            if (appliedTag) {
                appliedTag.classList.add('hidden');
                appliedTag.classList.remove('flex');
            }
            if (couponInput) couponInput.value = '';
        }
    }

    function showCouponMessage(msg, className) {
        if (!couponMessage) return;
        couponMessage.textContent = msg;
        couponMessage.className = `text-[9px] font-bold mt-2 block ${className}`;
        
        // Tự tắt sau 3 giây trừ khi là lỗi đỏ
        if (!className.includes('text-red')) {
            setTimeout(() => {
                if (couponMessage.textContent === msg) {
                    couponMessage.textContent = '';
                }
            }, 3000);
        }
    }

    function removeCoupon() {
        appliedCoupon = null;
        discountAmount = 0;
        toggleCouponInputDisplay(false);
        showCouponMessage('Đã gỡ bỏ mã giảm giá', 'opacity-40');
        renderSummary();
    }

    async function handleApplyCoupon() {
        const code = couponInput.value.trim();
        if (!code) return;

        const currentTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        try {
            const response = await fetch(`/api/coupons/apply?currentTotal=${currentTotal}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponCode: code })
            });

            const result = await response.json();

            if (response.ok) {
                appliedCoupon = result;
                updateDiscountUI();
                showCouponMessage(`Áp dụng mã ${code} thành công!`, 'text-emerald-500');
                toggleCouponInputDisplay(true);
            } else {
                appliedCoupon = null;
                discountAmount = 0;
                couponMessage.textContent = result.message || 'Mã giảm giá không hợp lệ';
                couponMessage.className = 'text-[9px] font-bold mt-2 text-red-500 block';
                if (window.Toast) Toast.error(result.message || 'Mã giảm giá không hợp lệ');
                renderSummary();
            }
        } catch (error) {
            console.error('Coupon error:', error);
            if (window.Toast) Toast.error('Lỗi hệ thống khi áp dụng mã!');
            else alert('Lỗi hệ thống khi áp dụng mã!');
        } finally {
            applyCouponBtn.disabled = false;
            applyCouponBtn.textContent = 'ÁP DỤNG';
        }
    }

    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', handleApplyCoupon);
    }

    // Modal Coupon Selector Logic
    const openCouponBtn = document.getElementById('open-coupon-selector-btn');
    const couponModal = document.getElementById('coupon-selector-modal');
    const closeCouponBtn = document.getElementById('close-coupon-modal');
    const couponSelectionList = document.getElementById('coupon-selection-list');

    function toggleCouponModal(show) {
        if (show) {
            couponModal.classList.remove('hidden');
            couponModal.classList.add('flex');
            setTimeout(() => {
                couponModal.classList.remove('opacity-0');
                couponModal.classList.add('opacity-100');
            }, 10);
            loadCouponsForSelector();
        } else {
            couponModal.classList.remove('opacity-100');
            couponModal.classList.add('opacity-0');
            setTimeout(() => {
                couponModal.classList.add('hidden');
                couponModal.classList.remove('flex');
            }, 300);
        }
    }

    async function loadCouponsForSelector() {
        if (!couponSelectionList) return;
        
        try {
            const response = await fetch(`/api/coupons`);
            if (response.ok) {
                const coupons = await response.json();
                renderCouponList(coupons);
            } else {
                couponSelectionList.innerHTML = '<p class="text-[10px] font-bold opacity-40 uppercase text-center py-10">Không thể tải danh sách mã</p>';
            }
        } catch (error) {
            console.error('Error loading coupons for selector:', error);
        }
    }

    function renderCouponList(coupons) {
        // Chỉ lấy mã đã lưu (collected), chưa dùng (!used) và chưa hết hạn
        const now = new Date();
        const available = coupons.filter(c => c.collected && !c.used && new Date(c.expiryDate) > now);
        
        if (available.length === 0) {
            couponSelectionList.innerHTML = '<p class="text-[10px] font-bold opacity-40 uppercase text-center py-20">Ví của bạn hiện đang rỗng</p>';
            return;
        }

        const currentSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        let html = '';
        available.sort((a, b) => b.discountValue - a.discountValue); // Ưu tiên mã giảm nhiều hơn lên đầu

        available.forEach(c => {
            const isEligible = currentSubtotal >= c.minOrderAmount;
            const discountLabel = c.discountType === 'PERCENTAGE' ? c.discountValue + '%' : formatVND(c.discountValue);
            
            html += `
                <div class="group relative bg-white border ${isEligible ? 'border-outline/10 hover:border-primary/40 cursor-pointer' : 'border-outline/5 opacity-50'} p-6 transition-all no-radius select-coupon-item" data-code="${c.code}" data-eligible="${isEligible}">
                    <div class="flex items-start justify-between">
                        <div class="space-y-4">
                            <div class="flex items-center gap-2">
                                <span class="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 no-radius uppercase tracking-widest">${c.code}</span>
                                ${isEligible ? '' : '<span class="text-[8px] font-black text-red-500 uppercase tracking-widest">[Chưa đủ điều kiện]</span>'}
                            </div>
                            <div>
                                <h4 class="text-lg font-black tracking-tight text-on-surface uppercase">Giảm ${discountLabel}</h4>
                                <p class="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1">Đơn tối thiểu ${formatVND(c.minOrderAmount)}</p>
                            </div>
                        </div>
                        <div class="text-right">
                             <p class="text-[8px] font-black text-secondary uppercase tracking-widest mb-1">Hết hạn sau</p>
                             <p class="text-[10px] font-bold opacity-60">${formatRelativeTime(c.expiryDate)}</p>
                        </div>
                    </div>
                    ${isEligible ? `
                        <div class="mt-6 flex justify-end">
                            <span class="text-[9px] font-black uppercase text-primary tracking-[0.2em] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Dùng mã này <span class="material-symbols-outlined text-[14px]">arrow_right_alt</span></span>
                        </div>
                    ` : `
                        <div class="mt-4 pt-4 border-t border-outline/5">
                            <p class="text-[9px] font-bold text-red-400 italic">Bạn cần mua thêm ${formatVND(c.minOrderAmount - currentSubtotal)} để sử dụng mã này</p>
                        </div>
                    `}
                </div>
            `;
        });

        couponSelectionList.innerHTML = html;

        // Gán sự kiện click cho từng mã
        document.querySelectorAll('.select-coupon-item').forEach(item => {
            if (item.dataset.eligible === 'true') {
                item.addEventListener('click', () => {
                    const code = item.dataset.code;
                    couponInput.value = code;
                    toggleCouponModal(false);
                    handleApplyCoupon();
                });
            }
        });
    }

    function formatRelativeTime(dateStr) {
        const diff = new Date(dateStr) - new Date();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days} ngày ${hours} giờ`;
        return `${hours} giờ`;
    }

    if (openCouponBtn) openCouponBtn.addEventListener('click', () => toggleCouponModal(true));
    if (closeCouponBtn) closeCouponBtn.addEventListener('click', () => toggleCouponModal(false));
    
    const removeCouponBtn = document.getElementById('remove-coupon-btn');
    if (removeCouponBtn) removeCouponBtn.addEventListener('click', removeCoupon);

    if (couponModal) {
        couponModal.addEventListener('click', (e) => {
            if (e.target === couponModal) toggleCouponModal(false);
        });
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
    const defaultPayment = document.querySelector('[data-method="MOMO"]');
    if (defaultPayment) defaultPayment.classList.add('selected');

    // 4. Đặt hàng
    placeOrderBtn.addEventListener('click', async () => {
        const originalText = placeOrderBtn.textContent;
        const fullName = document.getElementById('checkout-fullname').value.trim();
        const phone = document.getElementById('checkout-phone').value.trim();
        const address = document.getElementById('checkout-address').value.trim();

        if (!fullName || !phone || !address) {
            if (window.Toast) Toast.error('Vui lòng nhập đầy đủ thông tin giao hàng!');
            else alert('Khách hàng vui lòng nhập đầy đủ: Họ tên, Số điện thoại và Địa chỉ giao hàng!');
            return;
        }

        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = `
            <div class="flex items-center justify-center gap-3">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang xử lý...</span>
            </div>
        `;

        try {
            // Kiểm tra và đồng bộ hóa cartItemId (KHÔNG dùng CartUtils.addToCart để tránh cộng dồn)
            for (let i = 0; i < cartItems.length; i++) {
                if (!cartItems[i].cartItemId) {
                    const syncRes = await fetch(`/api/cart`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            variantId: cartItems[i].variantId || cartItems[i].id,
                            quantity: cartItems[i].quantity
                        })
                    });
                    if (syncRes.ok) {
                        const syncData = await syncRes.json();
                        cartItems[i].cartItemId = syncData.cartItemId;
                    }
                }
            }

            const cartItemIds = cartItems.map(item => item.cartItemId).filter(id => id != null);
            
            if (cartItemIds.length !== cartItems.length) {
                throw new Error('Không thể đồng bộ hóa một số sản phẩm. Vui lòng thử lại!');
            }

            const orderData = {
                cartItemIds: cartItemIds,
                shippingAddress: `${fullName} | ${phone} | ${address}`,
                paymentMethod: selectedMethod,
                couponCode: appliedCoupon ? (appliedCoupon.couponCode || appliedCoupon.code) : null
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (response.ok) {
                // Xóa dữ liệu chọn mua
                localStorage.removeItem('hy_checkout_ids');
                
                // Cập nhật giỏ hàng local bằng cách loại bỏ các món đã mua
                if (typeof CartUtils !== 'undefined') {
                    let localCart = CartUtils.getCart();
                    const purchasedVariantIds = cartItems.map(item => String(item.variantId || item.id));
                    localCart = localCart.filter(item => !purchasedVariantIds.includes(String(item.id)));
                    CartUtils.saveCartLocallyOnly(localCart);
                    CartUtils.updateCartIconBadge();
                }

                if (selectedMethod === 'MOMO') {
                    // Chuyển hướng sang trang tóm tắt thanh toán để xem countdown và chi tiết
                    window.location.href = `/checkout/payment-summary?orderId=${result.orderId}`;
                } else {
                    if (window.Toast) Toast.success('Đặt hàng thành công!');
                    setTimeout(() => {
                        window.location.href = '/personal-center?tab=orders';
                    }, 1000);
                }
            } else {
                throw new Error(result.message || 'Có lỗi xảy ra khi đặt hàng!');
            }
        } catch (error) {
            console.error('Order/Sync error:', error);
            if (window.Toast) Toast.error(error.message || 'Lỗi hệ thống!');
            else alert(error.message || 'Hệ thống đang bận, vui lòng thử lại!');
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = originalText;
        }
    });

    // Load dữ liệu ban đầu
    loadCheckoutData();
    loadUserProfile();
});
