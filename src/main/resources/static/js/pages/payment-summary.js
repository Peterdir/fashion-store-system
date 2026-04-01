document.addEventListener('DOMContentLoaded', async () => {
    const orderId = window.CURRENT_ORDER_ID;
    if (!orderId) {
        window.location.href = '/';
        return;
    }

    const timerEl = document.getElementById('countdown-timer');
    const btnPay = document.getElementById('btn-pay-now');
    const itemsListEl = document.getElementById('summary-items-list');

    let orderData = null;
    let timerInterval = null;

    async function fetchOrderDetails() {
        try {
            const response = await fetch(`/api/orders/${orderId}`);
            if (!response.ok) throw new Error('Không thể tải thông tin đơn hàng');
            
            orderData = await response.json();
            renderOrderDetails();
            startCountdown();
        } catch (error) {
            console.error('Error:', error);
            if (window.Toast) Toast.error('Lỗi khi tải thông tin đơn hàng');
            else alert('Lỗi khi tải thông tin đơn hàng!');
        }
    }

    function formatVND(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    }

    function renderOrderDetails() {
        if (!orderData) return;

        // Render Shipping Info
        const shippingParts = orderData.shippingAddress.split(' | ');
        document.getElementById('summary-recipient-name').textContent = shippingParts[0] || 'N/A';
        document.getElementById('summary-recipient-phone').textContent = shippingParts[1] || 'N/A';
        document.getElementById('summary-recipient-address').textContent = shippingParts[2] || 'N/A';

        // Render Totals
        document.getElementById('summary-subtotal').textContent = formatVND(orderData.subtotalAmount || orderData.totalAmount);
        
        if (orderData.discountAmount > 0) {
            document.getElementById('summary-coupon-row').classList.remove('hidden');
            document.getElementById('summary-discount').textContent = '-' + formatVND(orderData.discountAmount);
        }
        
        document.getElementById('summary-grandtotal').textContent = formatVND(orderData.totalAmount);

        // Render Items
        let itemsHtml = '';
        orderData.items.forEach(item => {
            itemsHtml += `
                <div class="flex gap-4 items-center">
                    <div class="w-16 h-20 bg-neutral-100 shrink-0 border border-neutral-100 overflow-hidden">
                        <img src="${item.productImage || '/images/placeholder.png'}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-grow">
                        <h4 class="text-[10px] font-black uppercase tracking-tight line-clamp-1">${item.productName}</h4>
                        <p class="text-[9px] font-bold opacity-40 uppercase mt-1">Màu: ${item.color} | Size: ${item.size}</p>
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-[9px] font-black opacity-60">x${item.quantity}</span>
                            <span class="text-[11px] font-black">${formatVND(item.price)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        itemsListEl.innerHTML = itemsHtml;
    }

    function startCountdown() {
        if (!orderData) return;

        const orderTime = new Date(orderData.orderDate).getTime();
        const expireTime = orderTime + (10 * 60 * 1000);

        function updateTimer() {
            const now = new Date().getTime();
            const distance = expireTime - now;

            if (distance < 0) {
                clearInterval(timerInterval);
                timerEl.textContent = "00:00";
                timerEl.classList.add('text-rose-500');
                btnPay.disabled = true;
                btnPay.innerHTML = "ĐƠN HÀNG ĐÃ HẾT HẠN";
                if (window.Toast) Toast.error('Đơn hàng đã hết hạn giữ hàng!');
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (distance < 60000) {
                timerEl.classList.add('animate-pulse', 'text-rose-400');
            }
        }

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }

    btnPay.addEventListener('click', async () => {
        const originalContent = btnPay.innerHTML;
        btnPay.disabled = true;
        btnPay.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> ĐANG KẾT NỐI...';

        try {
            const response = await fetch(`/api/orders/${orderId}/retry-payment`, {
                method: 'POST'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.message) {
                    window.location.href = result.message; // result.message contains the URL
                } else {
                    throw new Error('Không nhận được link thanh toán');
                }
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Lỗi thanh toán');
            }
        } catch (error) {
            console.error('Payment Error:', error);
            if (window.Toast) Toast.error(error.message);
            else alert(error.message);
            btnPay.disabled = false;
            btnPay.innerHTML = originalContent;
        }
    });

    fetchOrderDetails();
});
