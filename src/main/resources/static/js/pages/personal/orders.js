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
     * Status mapping: Frontend Tab -> Backend Enum
     */
    statusMapping: {
        'all': null,
        'unpaid': 'PENDING_PAYMENT',
        'processing': 'PROCESSING',
        'shipped': 'SHIPPING',
        'review': 'DELIVERED',
        'return': 'CANCELLED'
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
            if (backendStatus) {
                url += `&status=${backendStatus}`;
            }

            console.log('Fetching orders from URL:', url);

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch orders');
            
            const data = await response.json();
            
            // Render the data
            this.renderOrders(data.content || []);

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
    renderOrders(orders) {
        const container = document.getElementById('order-tab-content-area');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 opacity-40">
                    <span class="material-symbols-outlined text-6xl mb-4">inventory_2</span>
                    <p class="text-[11px] font-black uppercase tracking-[0.2em]">Bạn chưa có đơn hàng nào trong mục này</p>
                    <a href="/category" class="mt-6 border border-black px-8 py-2 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all">Mua sắm ngay</a>
                </div>
            `;
            return;
        }

        // Reset container style for list
        container.classList.remove('items-center', 'justify-center', 'min-h-[400px]');
        container.classList.add('block', 'p-0', 'border-none', 'shadow-none', 'bg-transparent', 'space-y-6');

        const html = orders.map(order => this.renderOrderCard(order)).join('');
        container.innerHTML = html;
    },

    /**
     * Create HTML for individual order card
     */
    renderOrderCard(order) {
        const date = new Date(order.orderDate).toLocaleDateString('vi-VN');
        const total = new Intl.NumberFormat('vi-VN').format(order.totalAmount);
        
        // Status display
        let statusHtml = '';
        if (order.statusSummary) {
            statusHtml = Object.entries(order.statusSummary).map(([status, count]) => {
                const label = this.getStatusLabel(status);
                return `<span class="bg-surface-low px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-outline/10">${label} (${count})</span>`;
            }).join(' ');
        }

        const strOrderId = 'ORD-' + String(order.orderId).padStart(6, '0');

        return `
            <div class="bg-white p-6 shadow-sm border border-outline/5 hover:shadow-md transition-all group">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-outline/5">
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <p class="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Mã đơn hàng</p>
                            <span class="bg-black text-white px-2 py-0.5 rounded font-mono text-[9px] tracking-[0.2em] shadow-sm">${strOrderId}</span>
                        </div>
                        <p class="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Ngày đặt: <span class="text-on-surface">${date}</span></p>
                    </div>
                    <div class="flex items-center gap-2">
                        ${statusHtml}
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold text-on-surface-variant uppercase">Phương thức:</span>
                        <span class="text-[11px] font-black uppercase tracking-widest">${order.paymentMethod}</span>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-bold text-on-surface-variant uppercase">Tổng thanh toán</p>
                        <p class="text-lg font-black text-secondary">${total}đ</p>
                    </div>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                    <button onclick="window.location.href='/personal/order/${order.orderId}'" class="border border-outline/20 px-6 py-2 text-[9px] font-black uppercase tracking-widest hover:border-black transition-all">Chi tiết</button>
                    ${order.paymentMethod === 'MOMO' && order.statusSummary['PENDING_PAYMENT'] ? 
                        `<button class="bg-primary text-white px-6 py-2 text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all">Thanh toán lại</button>` : ''
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
