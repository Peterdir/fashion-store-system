/**
 * Order Detail Manager - Handles data fetching and UI rendering for order detail page
 */
class OrderDetailManager {
    constructor() {
        this.orderId = null;
        this.fallbackImg = 'https://vietcetera.com/uploads/images/15-apr-2021/screen-shot-2021-04-15-at-13-21-47-1618467727402.png';
        
        // Cache DOM elements
        this.loadingEl = document.getElementById('loading');
        this.errorEl = document.getElementById('error');
        this.errorMsgEl = document.getElementById('error-msg');
        this.containerEl = document.getElementById('order-container');
        this.itemsListEl = document.getElementById('items-list');
    }

    /**
     * Entry point
     */
    async init(orderId) {
        if (!orderId) {
            this.showError('Mã đơn hàng không hợp lệ.');
            return;
        }
        this.orderId = orderId;
        await this.bootstrap();
    }

    /**
     * Fetch & Render
     */
    async bootstrap() {
        try {
            const response = await fetch(`/api/orders/${this.orderId}`);
            
            if (response.status === 404 || response.status === 403) {
                throw new Error('Dữ liệu không tồn tại hoặc bạn không có quyền truy cập.');
            }
            if (!response.ok) throw new Error('Hệ thống từ chối yêu cầu dữ liệu.');

            const orderData = await response.json();
            this.renderUI(orderData);
            
            // Show container
            this.loadingEl.classList.add('hidden');
            this.containerEl.classList.remove('hidden');
        } catch (err) {
            console.error('[OrderDetail] Error:', err);
            this.showError(err.message);
        }
    }

    /**
     * Render entire UI
     */
    renderUI(data) {
        // 1. Header Info
        this.renderHeader(data);
        
        // 2. Items List
        this.renderItems(data.items, data.orderDate);
        
        // 3. Payment Summary
        this.renderPaymentSummary(data);
        
        // 4. Shipping Info
        this.renderShippingInfo(data.shippingAddress);
    }

    renderHeader(data) {
        const dateObj = new Date(data.orderDate);
        const dateStr = dateObj.toLocaleDateString('vi-VN') + ' ' + dateObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
        
        document.getElementById('o-date').textContent = dateStr;
        document.getElementById('o-pay').textContent = data.paymentMethod || 'COD';
        document.getElementById('o-total').textContent = this.formatCurrency(data.totalAmount);
        
        // Add Buy Again button for terminal statuses in header or actions area
        const terminalStatuses = ['COMPLETED', 'CANCELLED', 'PAYMENT_FAILED', 'PAYMENT_EXPIRED'];
        const isTerminal = data.items.some(item => terminalStatuses.includes(item.status)) || terminalStatuses.includes(data.status);
        
        const actionArea = document.getElementById('header-action-area');
        if (actionArea && isTerminal) {
            actionArea.innerHTML = `
                <button onclick="orderDetailManager.repurchaseOrder()" 
                        class="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">refresh</span>
                    Mua lại đơn hàng
                </button>
            `;
        }
    }

    renderItems(items, orderDate) {
        if (!items || items.length === 0) {
            this.itemsListEl.innerHTML = `<div class="p-8 text-center text-gray-400">Không tìm thấy sản phẩm.</div>`;
            return;
        }

        this.itemsListEl.innerHTML = items.map(item => this.renderItemRow(item, orderDate)).join('');
    }

    renderItemRow(item, orderDate) {
        const statusTheme = this.getStatusTheme(item.status);
        const trackingHtml = this.generateTrackingTimelineHTML(item.status, orderDate);
        
        let imgUrl = item.productImage || this.fallbackImg;
        if (imgUrl && !imgUrl.startsWith('/') && !imgUrl.startsWith('http')) {
            imgUrl = '/' + imgUrl;
        }

        const itemTotal = item.price * item.quantity;

        // Refund/Cancel notes
        let metaHtml = '';
        if (item.refundStatus) {
            metaHtml += `<p class="mt-2 text-[9px] font-black uppercase text-pink-500 bg-pink-50 self-end px-3 py-1 rounded-full border border-pink-100">💰 Hoàn tiền: ${item.refundStatus}</p>`;
        }
        if (item.cancellationReason) {
            metaHtml += `<p class="mt-2 text-[10px] text-red-600 font-medium italic border-l-2 border-red-400 pl-3">Lý do hủy: ${item.cancellationReason}</p>`;
        }

        // Return button
        let returnBtn = '';
        if ((item.status === 'DELIVERED' || item.status === 'COMPLETED') && !item.refundStatus) {
            returnBtn = `
                <button onclick="orderDetailManager.handleReturn(${item.orderItemId}, '${item.productName.replace(/'/g, "\\'")}')" 
                        class="mt-2 text-[8px] font-black uppercase text-red-500 border border-red-200 px-4 py-1.5 hover:bg-red-50 transition-all active:scale-95">
                    Yêu cầu trả hàng
                </button>
            `;
        }

        return `
            <div class="p-5 flex flex-col hover:bg-gray-50/30 transition-all duration-300">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div class="flex items-center gap-5 flex-1 w-full">
                        <a href="/product-detail/${item.productId}" class="relative w-16 h-20 flex-shrink-0 shadow-sm border border-black/5 rounded-sm overflow-hidden group/img">
                            <img src="${imgUrl}" class="w-full h-full object-cover transition-all duration-500 group-hover/img:scale-110" onerror="this.src='${this.fallbackImg}'">
                        </a>
                        <div class="flex-1 min-w-0">
                            <a href="/product-detail/${item.productId}" class="group/name">
                                <h4 class="text-sm font-black text-black uppercase tracking-tight mb-1 truncate group-hover/name:text-accent transition-colors">${item.productName}</h4>
                            </a>
                            <div class="flex flex-wrap gap-1.5 text-[9px] font-black uppercase tracking-widest mb-2.5">
                                <span class="bg-neutral-50 px-1.5 py-0.5 border">MÀU: ${item.color || 'FREE'}</span>
                                <span class="bg-neutral-50 px-1.5 py-0.5 border">SIZE: ${item.size || 'FREE'}</span>
                                <span class="bg-black text-white px-1.5 py-0.5">QTY: ${item.quantity}</span>
                            </div>
                            <span class="px-2 py-0.5 text-[7px] font-black tracking-[0.2em] uppercase rounded-sm border ${statusTheme.color}">${statusTheme.label}</span>
                            ${metaHtml}
                        </div>
                    </div>
                    <div class="flex flex-col items-end shrink-0 pt-4 md:pt-0 w-full md:w-auto border-t md:border-none border-dashed border-gray-200">
                        <p class="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Thành tiền</p>
                        <p class="text-xl font-black text-black tracking-tighter">${this.formatCurrency(itemTotal)}</p>
                        ${returnBtn}
                    </div>
                </div>
                <div class="mt-6">
                    ${trackingHtml}
                </div>
            </div>
        `;
    }

    renderPaymentSummary(data) {
        document.getElementById('o-subtotal').textContent = this.formatCurrency(data.subtotalAmount || 0);
        document.getElementById('o-final-total').textContent = this.formatCurrency(data.totalAmount);
        
        const discountRow = document.getElementById('discount-row');
        if (data.discountAmount && data.discountAmount > 0) {
            discountRow.classList.remove('hidden');
            document.getElementById('o-discount').textContent = '-' + this.formatCurrency(data.discountAmount);
            
            // Detailed coupon description
            let couponDesc = 'PROMOTION';
            if (data.couponCode) {
                couponDesc = `Mã: ${data.couponCode}`;
                if (data.discountValue && data.discountType) {
                    const typeLabel = data.discountType === 'PERCENTAGE' ? `${data.discountValue}%` : this.formatCurrency(data.discountValue);
                    couponDesc += ` (Giảm ${typeLabel})`;
                }
            }
            document.getElementById('o-coupon-code').textContent = couponDesc;
        } else {
            discountRow.classList.add('hidden');
        }
    }

    renderShippingInfo(rawAddress) {
        let fullName = 'Vô danh', phone = 'Bị ẩn', address = rawAddress || 'Trống';
        
        if (rawAddress && rawAddress.includes('|')) {
            const parts = rawAddress.split('|').map(s => s.trim());
            if (parts.length >= 3) {
                fullName = parts[0];
                phone = parts[1];
                address = parts.slice(2).join(', ');
            }
        }

        document.getElementById('o-shipping-info').innerHTML = `
            <div class="space-y-2">
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Họ và Tên</p>
                <p class="text-sm font-black text-gray-900 uppercase">${fullName}</p>
            </div>
            <div class="space-y-2">
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Số điện thoại</p>
                <p class="text-sm font-bold text-gray-900 font-mono">${phone}</p>
            </div>
            <div class="space-y-2 sm:col-span-2 pt-6 border-t border-gray-100/60 mt-2">
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Địa chỉ cụ thể</p>
                <p class="text-sm text-gray-700 font-medium leading-relaxed">${address}</p>
            </div>
        `;
    }

    generateTrackingTimelineHTML(status, orderDate) {
        if (!status || !orderDate) return '';
        const flowSteps = [
            { key: 'PENDING', label: 'Chờ xác nhận', icon: 'receipt_long' },
            { key: 'PAID', label: 'Thanh toán', icon: 'payments' },
            { key: 'PROCESSING', label: 'Chuẩn bị hàng', icon: 'inventory_2' },
            { key: 'SHIPPING', label: 'Đang giao', icon: 'local_shipping' },
            { key: 'DELIVERED', label: 'Hoàn tất', icon: 'check_circle' }
        ];

        let currentStepIdx = -1;
        const statusMap = {
            'PENDING_CONFIRMATION': 0, 'PENDING_PAYMENT': 0,
            'PAID': 1, 'PROCESSING': 2, 'SHIPPING': 3,
            'DELIVERED': 4, 'COMPLETED': 4
        };
        currentStepIdx = statusMap[status] ?? -1;

        if (currentStepIdx === -1) {
            const theme = this.getStatusTheme(status);
            return `
                <div class="mt-4 flex flex-col items-center justify-center p-3 bg-red-50 border border-red-100 rounded text-red-600 space-y-1">
                    <span class="material-symbols-outlined text-2xl">cancel</span>
                    <p class="text-[9px] font-black uppercase tracking-widest">${theme.label}</p>
                </div>
            `;
        }

        const progressPercent = (currentStepIdx / (flowSteps.length - 1)) * 100;
        const isOrderFinished = currentStepIdx >= 4;
        
        let nodesHtml = flowSteps.map((step, idx) => {
            const isActive = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            
            const textColor = isActive ? 'text-black font-black' : 'text-gray-400 font-bold';
            const iconBgColor = isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-400';
            
            // Add pulse animation only to the *current* node if order is not finished
            const animationClass = (isCurrent && !isOrderFinished) ? 'active-status-pulse ring-4 ring-black/5' : '';
            
            return `
                <div class="flex flex-col items-center relative z-10 w-11 sm:w-14">
                    <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${iconBgColor} ${animationClass} transition-all duration-500">
                        <span class="material-symbols-outlined text-[10px] sm:text-xs font-light">${step.icon}</span>
                    </div>
                    <p class="mt-2 text-[7px] sm:text-[8px] tracking-widest uppercase ${textColor} text-center leading-tight">
                        ${step.label}
                        ${isCurrent && !isOrderFinished ? `<span class="block mt-0.5 text-[5.5px] animate-pulse lowercase font-normal italic">đang xử lý...</span>` : ''}
                    </p>
                </div>
            `;
        }).join('');

        return `
            <div class="mt-6 pt-4 border-t border-dashed border-gray-200">
                <div class="relative w-full max-w-lg mx-auto px-1 sm:px-4 py-1">
                    <!-- Background Gray Line -->
                    <div class="absolute top-[16px] sm:top-[18px] left-5 sm:left-10 right-5 sm:right-10 h-[1.5px] border-t border-dashed border-gray-200 z-0"></div>
                    
                    <!-- Progress Black Line (with shimmer if not finished) -->
                    <div class="absolute top-[16px] sm:top-[18px] left-5 sm:left-10 h-[1.5px] z-0 transition-all duration-1000 ease-out ${!isOrderFinished ? 'shimmer-bar' : 'bg-black'}" 
                         style="width: calc(${progressPercent}% - 2.5rem);"></div>
                    
                    <div class="flex justify-between items-start w-full relative z-10">${nodesHtml}</div>
                </div>
            </div>
        `;
    }

    /**
     * Handle Return Request
     */
    async handleReturn(orderItemId, productName) {
        const reason = prompt(`Vui lòng nhập lý do trả hàng cho sản phẩm "${productName}":`);
        if (!reason) return;

        try {
            const response = await fetch('/api/return-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderItemId, reason })
            });

            if (response.ok) {
                alert('Yêu cầu đã được gửi.');
                location.reload();
            } else {
                const err = await response.json();
                alert(err.message || 'Lỗi gửi yêu cầu.');
            }
        } catch (error) {
            alert('Lỗi kết nối máy chủ.');
        }
    }

    /**
     * Utils
     */
    formatCurrency(val) {
        return new Intl.NumberFormat('vi-VN').format(val) + ' ₫';
    }

    getStatusTheme(status) {
        const map = {
            'PENDING_CONFIRMATION': { label: 'Chờ xác nhận', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
            'PENDING_PAYMENT': { label: 'Chờ thanh toán', color: 'bg-orange-50 text-orange-700 border-orange-100' },
            'PAID': { label: 'Đã thanh toán', color: 'bg-green-50 text-green-700 border-green-100' },
            'PROCESSING': { label: 'Đang chuẩn bị', color: 'bg-blue-50 text-blue-700 border-blue-100' },
            'SHIPPING': { label: 'Đang giao', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
            'DELIVERED': { label: 'Đã giao', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            'COMPLETED': { label: 'Hoàn tất', color: 'bg-gray-50 text-gray-700 border-gray-100' },
            'CANCELLED': { label: 'Đã hủy', color: 'bg-red-50 text-red-700 border-red-100' },
            'PAYMENT_FAILED': { label: 'Thanh toán lỗi', color: 'bg-red-50 text-red-700 border-red-100' }
        };
        return map[status] || { label: status, color: 'bg-gray-50 text-gray-700 border-gray-100' };
    }

    /**
     * Repurchase the current order
     */
    async repurchaseOrder() {
        if (!confirm('Bạn có muốn thêm tất cả sản phẩm trong đơn hàng này vào giỏ hàng để mua lại không?')) {
            return;
        }

        try {
            const response = await fetch(`/api/orders/${this.orderId}/repurchase`, {
                method: 'POST'
            });

            if (response.ok) {
                alert('Đã thêm tất cả sản phẩm vào giỏ hàng thành công!');
                window.location.href = '/cart';
            } else {
                const err = await response.json();
                alert('Lỗi: ' + (err.message || 'Không thể thực hiện mua lại lúc này.'));
            }
        } catch (error) {
            console.error('Repurchase error:', error);
            alert('Lỗi kết nối server.');
        }
    }

    showError(msg) {
        this.loadingEl.classList.add('hidden');
        this.errorEl.classList.remove('hidden');
        this.errorMsgEl.textContent = msg;
    }
}

// Global instance to handle onclick events from dynamic HTML
window.orderDetailManager = new OrderDetailManager();
