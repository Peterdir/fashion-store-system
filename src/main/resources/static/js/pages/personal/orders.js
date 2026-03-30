/**
 * My Orders Module
 * Handles loading, filtering, and rendering of user orders.
 */

const OrderModule = {
    userId: null,
    currentStatus: 'all',
    currentPage: 0,

    /**
     * Initialize with User ID
     */
    init(userId) {
        console.log('--- OrderModule Initializing ---');
        console.log('UserID received:', userId);
        this.userId = userId;
        this.setupListeners();
    },

    /**
     * Status mapping: Frontend Tab -> Backend Enum (multi-status enabled)
     */
    statusMapping: {
        'all': null,
        'unpaid': 'PENDING_PAYMENT,PENDING_CONFIRMATION',
        'processing': 'PAID,PROCESSING',
        'shipped': 'SHIPPING',
        'review': 'DELIVERED,COMPLETED',
        'return': 'CANCELLED,PAYMENT_FAILED,PAYMENT_EXPIRED'
    },

    /**
     * Setup UI listeners for order-specific interactions
     */
    setupListeners() {
        const orderSubtabs = document.querySelectorAll('.order-subtab');
        orderSubtabs.forEach(subtab => {
            subtab.addEventListener('click', () => {
                const status = subtab.getAttribute('data-status');
                if (status) {
                    this.currentStatus = status;
                    this.loadOrders(status);
                }
            });
        });

        // Dashboard order shortcuts
        const dashboardOrderBtns = document.querySelectorAll('#tab-dashboard .tab-link[data-tab="orders"]');
        dashboardOrderBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const status = btn.getAttribute('data-status') || 'all';
                this.currentStatus = status;
                // Tab switching is handled by PersonalCenter, we just need to ensure data loads
                this.loadOrders(status);
            });
        });
    },

    /**
     * Fetch orders from API
     */
    async loadOrders(status = 'all', page = 0) {
        if (!this.userId) {
            console.error('UserId is missing, cannot load orders');
            return;
        }

        const contentArea = document.getElementById('order-tab-content-area');
        const loadingArea = document.getElementById('order-loading');

        if (loadingArea) loadingArea.classList.remove('hidden');
        if (contentArea) {
            contentArea.classList.add('hidden');
            contentArea.innerHTML = '';
        }

        try {
            const backendStatus = this.statusMapping[status] || null;
            let url = `/api/orders?userId=${this.userId}&page=${page}&size=10`;
            let isItemCard = false;

            if (status !== 'all') {
                url = `/api/orders/items?userId=${this.userId}&page=${page}&size=10`;
                isItemCard = true;
            }

            if (backendStatus) {
                url += `&statuses=${backendStatus}`;
            }

            console.log('Fetching orders from URL:', url);

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch orders');
            
            const data = await response.json();
            
            // Render the data with the correct card format
            this.renderOrders(data.content || [], isItemCard);

            // Hide loading
            if (loadingArea) loadingArea.classList.add('hidden');
            if (contentArea) contentArea.classList.remove('hidden');
            
        } catch (error) {
            console.error('Order/Query error:', error);
            if (loadingArea) loadingArea.classList.add('hidden');
            if (contentArea) {
                contentArea.classList.remove('hidden');
                contentArea.innerHTML = `<p class="text-xs text-red-500 font-bold">Lỗi khi tải đơn hàng. Vui lòng thử lại sau.</p>`;
            }
        }
    },

    /**
     * Render the list of orders
     */
    renderOrders(orders, isItemCard = false) {
        const container = document.getElementById('order-tab-content-area');
        if (!container) return;

        if (orders.length === 0) {
            let emptyIcon = 'package_2';
            let emptyTitle = 'Trống Trơn!';
            let emptyDesc = 'Bạn chưa có bất kỳ đơn hàng nào trong hệ thống.';

            switch (this.currentStatus) {
                case 'unpaid':
                    emptyIcon = 'account_balance_wallet';
                    emptyTitle = 'Tuyệt vời!';
                    emptyDesc = 'Bạn không có đơn hàng nào đang bị nợ hay chờ thanh toán.';
                    break;
                case 'processing':
                    emptyIcon = 'inventory_2';
                    emptyTitle = 'Tất cả đã sẵn sàng!';
                    emptyDesc = 'Không có đơn hàng nào đang bị kẹt ở khâu xử lý hay đóng gói.';
                    break;
                case 'shipped':
                    emptyIcon = 'local_shipping';
                    emptyTitle = 'Đường thông hè thoáng!';
                    emptyDesc = 'Hiện tại không có kiện hàng nào của bạn đang trên đường vận chuyển.';
                    break;
                case 'review':
                    emptyIcon = 'rate_review';
                    emptyTitle = 'Chưa có lịch sử nhận hàng!';
                    emptyDesc = 'Những đơn hàng đã giao thành công và hoàn tất sẽ xuất hiện lưu trữ ở đây.';
                    break;
                case 'return':
                    emptyIcon = 'assignment_return';
                    emptyTitle = 'Thật đáng mừng!';
                    emptyDesc = 'Bạn không có đơn hàng nào bị hủy, giao dịch lỗi hay phải hoàn trả.';
                    break;
                case 'all':
                default:
                    emptyIcon = 'shopping_bag';
                    emptyTitle = 'Tủ đồ của bạn đang trống!';
                    emptyDesc = 'Tất cả các giao dịch mua sắm của bạn trong quá khứ sẽ được thống kê tại đây.';
                    break;
            }

            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 opacity-40 hover:opacity-100 transition-opacity">
                    <span class="material-symbols-outlined text-teal-600 text-6xl mb-4">${emptyIcon}</span>
                    <h3 class="text-sm font-black uppercase tracking-[0.1em] text-black mb-1">${emptyTitle}</h3>
                    <p class="text-[10px] font-bold tracking-widest text-center text-gray-500 max-w-sm leading-relaxed">${emptyDesc}</p>
                    <a href="/category" class="mt-8 border border-black text-black px-10 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">Bắt đầu mua sắm</a>
                </div>
            `;
            return;
        }

        // Reset container style for list
        container.classList.remove('items-center', 'justify-center', 'min-h-[400px]');
        container.classList.add('block', 'p-0', 'border-none', 'shadow-none', 'bg-transparent', 'space-y-6');

        const html = orders.map(order => isItemCard ? this.renderOrderItemCard(order) : this.renderOrderCard(order)).join('');
        container.innerHTML = html;
    },

    /**
     * Create HTML for individual Single Product Item card
     */
    renderOrderItemCard(item) {
        const date = new Date(item.orderDate).toLocaleDateString('vi-VN');
        const price = new Intl.NumberFormat('vi-VN').format(item.price);
        const total = new Intl.NumberFormat('vi-VN').format(item.itemTotalAmount || (item.price * item.quantity));
        const statusEnum = item.status || 'PENDING_PAYMENT';
        let statusString = 'Đã đặt';
        let statusColor = 'text-gray-500 bg-gray-50 border-gray-200';

        switch (statusEnum) {
            case 'PENDING_PAYMENT':
            case 'PENDING_CONFIRMATION':
                statusString = 'Đang chờ'; 
                statusColor = 'text-yellow-700 bg-yellow-50 border-yellow-200'; break;
            case 'PAID':
            case 'PROCESSING':
                statusString = 'Đang xử lý'; 
                statusColor = 'text-blue-700 bg-blue-50 border-blue-200'; break;
            case 'SHIPPING':
                statusString = 'Đang giao'; 
                statusColor = 'text-indigo-700 bg-indigo-50 border-indigo-200'; break;
            case 'DELIVERED':
            case 'COMPLETED':
                statusString = 'Hoàn tất'; 
                statusColor = 'text-green-700 bg-green-50 border-green-200'; break;
            case 'CANCELLED':
            case 'PAYMENT_FAILED':
            case 'PAYMENT_EXPIRED':
                statusString = 'Hủy/Lỗi'; 
                statusColor = 'text-red-700 bg-red-50 border-red-200'; break;
        }

        const fallbackImg = 'https://vietcetera.com/uploads/images/15-apr-2021/screen-shot-2021-04-15-at-13-21-47-1618467727402.png';
        const imgUrl = item.productImage || fallbackImg;

        return `
            <div class="border border-black flex flex-col group hover:shadow-[3px_3px_0_0_#000] transition-all duration-300 relative overflow-hidden bg-white mb-4">
                
                <!-- Card Header -->
                <div class="border-b border-black p-3 flex flex-wrap gap-3 justify-between items-center bg-gray-50/40">
                    <div class="flex items-center gap-3">
                        <div class="bg-black text-white px-2 py-1 text-[9px] font-black tracking-widest uppercase truncate max-w-[120px]">
                            ORD-${item.orderId || '000'}
                        </div>
                        <span class="text-[10px] font-bold text-gray-400 font-mono flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">calendar_today</span> ${date}</span>
                    </div>
                    <div class="px-2 py-[2px] border text-[9px] font-black tracking-widest uppercase ${statusColor}">
                        ${statusString}
                    </div>
                </div>

                <!-- Card Body (Product Info) -->
                <div class="p-4 flex flex-col sm:flex-row gap-4 items-start">
                    <!-- Image Layout Khá gọn -->
                    <div class="relative w-16 h-20 flex-shrink-0 group-hover:scale-[1.03] transition-transform duration-300 origin-bottom border border-gray-100">
                         <img src="${imgUrl}" alt="${item.productName}" class="w-full h-full object-cover" onerror="this.src='${fallbackImg}'">
                    </div>
                    
                    <div class="flex-1 w-full space-y-2">
                        <h4 class="font-bold text-xs uppercase tracking-wide text-black line-clamp-2 leading-tight">${item.productName}</h4>
                        
                        <!-- Variation -->
                        <div class="flex flex-wrap gap-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                            <span class="bg-gray-50 px-2 py-[3px] border border-gray-100">${item.color || 'Màu tiêu chuẩn'}</span>
                            <span class="bg-gray-50 px-2 py-[3px] border border-gray-100 text-black">Size ${item.size || 'F'}</span>
                            <span class="bg-gray-50 px-2 py-[3px] border border-gray-100 text-black font-black">Số lượng: ${item.quantity}</span>
                        </div>

                        <!-- Price summary -->
                        <div class="pt-1 flex items-center gap-2">
                            <span class="text-[10px] font-medium text-gray-400 line-through">${price}đ</span>
                            <span class="text-sm font-black text-black">${total}đ</span>
                        </div>
                    </div>

                    <!-- Right Action Button -->
                    <div class="flex flex-row sm:flex-col gap-2 mt-2 sm:mt-0 w-full sm:w-[130px] flex-shrink-0">
                        <a href="/personal/order/${item.orderId}" class="flex-1 text-center flex items-center justify-center border border-black bg-black text-white px-3 py-2 text-[9px] font-black tracking-[0.1em] uppercase hover:bg-white hover:text-black transition-colors">
                            Tới hóa đơn
                        </a>
                        <button onclick="window.location.href='/category'" class="flex-1 text-center border border-gray-200 text-gray-500 px-3 py-2 text-[9px] font-black tracking-[0.1em] uppercase hover:border-black hover:text-black transition-colors cursor-pointer">
                            Mua lại nha
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Create HTML for individual (Whole) order card
     */
    renderOrderCard(order) {
        const date = new Date(order.orderDate).toLocaleDateString('vi-VN');
        const total = new Intl.NumberFormat('vi-VN').format(order.totalAmount);
        
        // Status display
        let statusHtml = '';
        if (order.statusSummary) {
            statusHtml = Object.entries(order.statusSummary).map(([status, count]) => {
                const label = this.getStatusLabel(status);
                return `<span class="bg-gray-50 px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-wider border border-gray-200">${label} (${count})</span>`;
            }).join(' ');
        }

        const strOrderId = 'ORD-' + String(order.orderId).padStart(6, '0');

        return `
            <div class="bg-white p-4 shadow-sm border border-black hover:shadow-[3px_3px_0_0_#000] transition-all group mb-4">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-outline/10">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="bg-black text-white px-2 py-1 text-[9px] font-black tracking-widest uppercase truncate max-w-[120px]">${strOrderId}</span>
                            <span class="text-[10px] font-bold text-gray-400 font-mono flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">calendar_today</span> ${date}</span>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-1">
                        ${statusHtml}
                    </div>
                </div>

                <div class="flex items-end justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">P.THỨC:</span>
                        <span class="text-[10px] font-black uppercase tracking-widest text-black">${order.paymentMethod || 'COD'}</span>
                    </div>
                    <div class="text-right">
                        <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">TỔNG THANH TOÁN</p>
                        <p class="text-base font-black text-black">${total}đ</p>
                    </div>
                </div>

                <div class="mt-4 flex justify-end gap-2">
                    <button onclick="window.location.href='/personal/order/${order.orderId}'" class="border border-black bg-white text-black px-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Chi tiết</button>
                    ${order.paymentMethod === 'MOMO' && order.statusSummary && order.statusSummary['PENDING_PAYMENT'] ? 
                        `<button class="bg-primary text-white px-4 py-2 text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all">Thu ngân</button>` : ''
                    }
                </div>
            </div>
        `;
    },

    /**
     * Convert Enum status to Vietnamese label
     */
    getStatusLabel(status) {
        const labels = {
            'PENDING_CONFIRMATION': 'Chờ xác nhận',
            'PENDING_PAYMENT': 'Chờ thanh toán',
            'PAID': 'Đã thanh toán',
            'PROCESSING': 'Đang xử lý',
            'SHIPPING': 'Đang giao hàng',
            'DELIVERED': 'Đã giao',
            'COMPLETED': 'Hoàn thành',
            'CANCELLED': 'Đã hủy',
            'PAYMENT_FAILED': 'Thanh toán lỗi',
            'PAYMENT_EXPIRED': 'Giao dịch hết hạn'
        };
        return labels[status] || status;
    }
};

// Expose to window for other scripts to access
window.OrderModule = OrderModule;
