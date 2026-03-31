/**
 * Admin Orders Management — H&Y Fashion Store
 * Gọi API từ AdminOrderController để hiển thị và quản lý đơn hàng.
 */
const AdminOrders = (() => {

    // ===== CONFIG =====
    const API = {
        LIST: '/api/admin/orders',
        DETAIL: (id) => `/api/admin/orders/${id}`,
        UPDATE_STATUS: (id) => `/api/admin/orders/${id}/status`,
        UPDATE_ITEM_STATUS: (itemId) => `/api/admin/orders/items/${itemId}/status`,
    };

    const PAGE_SIZE = 10;
    let currentPage = 0;

    // ===== STATUS MAPS =====
    const STATUS_LABELS = {
        PENDING_CONFIRMATION: 'Chờ xác nhận',
        PENDING_PAYMENT: 'Chờ thanh toán',
        PAID: 'Đã thanh toán',
        PROCESSING: 'Đang xử lý',
        SHIPPING: 'Đang giao',
        DELIVERED: 'Đã giao',
        COMPLETED: 'Hoàn thành',
        CANCELLED: 'Đã hủy',
        PAYMENT_FAILED: 'TT thất bại',
        PAYMENT_EXPIRED: 'TT hết hạn',
    };

    const STATUS_COLORS = {
        PENDING_CONFIRMATION: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' },
        PENDING_PAYMENT: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
        PAID: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
        PROCESSING: { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-400' },
        SHIPPING: { bg: 'bg-cyan-50', text: 'text-cyan-600', dot: 'bg-cyan-500' },
        DELIVERED: { bg: 'bg-teal-50', text: 'text-teal-600', dot: 'bg-teal-500' },
        COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
        CANCELLED: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
        PAYMENT_FAILED: { bg: 'bg-red-50', text: 'text-red-500', dot: 'bg-red-400' },
        PAYMENT_EXPIRED: { bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' },
    };

    const PAYMENT_LABELS = {
        COD: 'COD',
        VNPAY: 'VNPay',
        MOMO: 'MoMo',
        BANK_TRANSFER: 'Chuyển khoản',
    };

    // Allowed next statuses from current status (admin workflow)
    const STATUS_TRANSITIONS = {
        PENDING_CONFIRMATION: ['PROCESSING', 'CANCELLED'],
        PENDING_PAYMENT: ['CANCELLED'],
        PAID: ['PROCESSING', 'CANCELLED'],
        PROCESSING: ['SHIPPING', 'CANCELLED'],
        SHIPPING: ['DELIVERED'],
        DELIVERED: ['COMPLETED'],
    };

    // ===== DOM REFERENCES =====
    const $ = (id) => document.getElementById(id);

    // ===== UTILITY FUNCTIONS =====
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    }

    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }

    function formatDateTime(dateStr) {
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function renderStatusBadge(status) {
        const c = STATUS_COLORS[status] || STATUS_COLORS.CANCELLED;
        const label = STATUS_LABELS[status] || status;
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold ${c.bg} ${c.text} uppercase tracking-widest">
            <span class="w-1 h-1 rounded-full ${c.dot}"></span>${label}
        </span>`;
    }

    function showToast(message, type = 'success') {
        const container = $('admin-toast');
        const colors = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-amber-600';
        const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'warning';
        const toast = document.createElement('div');
        toast.className = `${colors} text-white px-4 py-3 text-[11px] font-bold flex items-center gap-2 shadow-lg transform translate-x-0 transition-all duration-300`;
        toast.innerHTML = `<span class="material-symbols-outlined text-[16px]">${icon}</span>${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-4');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== FETCH ORDERS =====
    async function fetchOrders(page = 0) {
        const status = $('filter-status').value;
        const startDate = $('filter-start-date').value;
        const endDate = $('filter-end-date').value;

        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', PAGE_SIZE);
        params.append('sort', 'orderDate,desc');
        if (status) params.append('status', status);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        $('orders-loading').classList.remove('hidden');
        $('orders-empty').classList.add('hidden');
        $('orders-table-body').innerHTML = '';
        $('orders-pagination').classList.add('hidden');

        try {
            const res = await fetch(`${API.LIST}?${params.toString()}&_t=${new Date().getTime()}`);
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/admin/login';
                return;
            }
            if (!res.ok) throw new Error('Lỗi khi tải danh sách đơn hàng');
            const data = await res.json();

            $('orders-loading').classList.add('hidden');

            if (!data.content || data.content.length === 0) {
                $('orders-empty').classList.remove('hidden');
                return;
            }

            renderTable(data.content);
            renderPagination(data);
            currentPage = data.number;
        } catch (err) {
            $('orders-loading').classList.add('hidden');
            $('orders-empty').classList.remove('hidden');
            showToast(err.message, 'error');
        }
    }

    // ===== RENDER TABLE =====
    function renderTable(orders) {
        const tbody = $('orders-table-body');
        tbody.innerHTML = orders.map(order => {
            // Determine dominant status from statusSummary map
            const dominantStatus = getDominantStatus(order.statusSummary);

            return `<tr class="hover:bg-neutral-50/50 transition-colors cursor-pointer" onclick="AdminOrders.openDetail(${order.orderId})">
                <td class="px-5 py-3.5 text-[12px] font-bold text-primary">#ORD-${String(order.orderId).padStart(4, '0')}</td>
                <td class="px-5 py-3.5 text-[12px] text-neutral-500 font-medium">${formatDate(order.orderDate)}</td>
                <td class="px-5 py-3.5 text-[11px] font-bold text-neutral-600">${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</td>
                <td class="px-5 py-3.5 text-[12px] font-bold text-neutral-700 text-center">${order.itemCount}</td>
                <td class="px-5 py-3.5 text-[12px] font-bold text-primary text-right">${formatCurrency(order.totalAmount)}</td>
                <td class="px-5 py-3.5 text-center">${renderStatusBadge(dominantStatus)}</td>
                <td class="px-5 py-3.5 text-center">
                    <button onclick="event.stopPropagation(); AdminOrders.openDetail(${order.orderId})" class="text-neutral-400 hover:text-accent transition-colors">
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                </td>
            </tr>`;
        }).join('');
    }

    function getDominantStatus(statusSummary) {
        if (!statusSummary || Object.keys(statusSummary).length === 0) return 'PENDING_CONFIRMATION';

        // Thứ tự ưu tiên: trạng thái THẤP nhất (ít tiến triển nhất) hiển thị trước
        // Nếu tất cả sản phẩm đều COMPLETED thì mới hiển thị COMPLETED
        const PRIORITY = [
            'PAYMENT_FAILED', 'PAYMENT_EXPIRED', 'CANCELLED',
            'PENDING_CONFIRMATION', 'PENDING_PAYMENT', 'PAID',
            'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED'
        ];

        const statuses = Object.keys(statusSummary);

        // Nếu chỉ có 1 trạng thái duy nhất → hiển thị nó
        if (statuses.length === 1) return statuses[0];

        // Lọc bỏ các trạng thái lỗi/hủy ra riêng
        const errorStatuses = ['CANCELLED', 'PAYMENT_FAILED', 'PAYMENT_EXPIRED'];
        const activeStatuses = statuses.filter(s => !errorStatuses.includes(s));

        // Nếu tất cả đều lỗi/hủy → hiển thị cái đầu tìm được
        if (activeStatuses.length === 0) {
            return statuses.sort((a, b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b))[0];
        }

        // Trả về trạng thái THẤP nhất trong các item đang hoạt động
        return activeStatuses.sort((a, b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b))[0];
    }

    // ===== RENDER PAGINATION =====
    function renderPagination(pageData) {
        const container = $('orders-pagination');
        container.classList.remove('hidden');

        const start = pageData.number * pageData.size + 1;
        const end = Math.min(start + pageData.numberOfElements - 1, pageData.totalElements);
        $('pagination-info').textContent = `Hiển thị ${start}–${end} / ${pageData.totalElements} đơn hàng`;

        const btns = $('pagination-buttons');
        btns.innerHTML = '';

        // Previous
        const prevBtn = createPageBtn('chevron_left', pageData.number - 1, pageData.first);
        btns.appendChild(prevBtn);

        // Page Numbers (show max 5)
        const totalPages = pageData.totalPages;
        const current = pageData.number;
        let startP = Math.max(0, current - 2);
        let endP = Math.min(totalPages - 1, startP + 4);
        startP = Math.max(0, endP - 4);

        for (let i = startP; i <= endP; i++) {
            const btn = document.createElement('button');
            btn.textContent = i + 1;
            btn.className = i === current
                ? 'w-8 h-8 text-[11px] font-black bg-primary text-white'
                : 'w-8 h-8 text-[11px] font-bold text-neutral-500 hover:bg-neutral-100 transition-colors';
            btn.addEventListener('click', () => fetchOrders(i));
            btns.appendChild(btn);
        }

        // Next
        const nextBtn = createPageBtn('chevron_right', pageData.number + 1, pageData.last);
        btns.appendChild(nextBtn);
    }

    function createPageBtn(icon, page, disabled) {
        const btn = document.createElement('button');
        btn.innerHTML = `<span class="material-symbols-outlined text-[16px]">${icon}</span>`;
        btn.className = `w-8 h-8 flex items-center justify-center ${disabled ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-500 hover:bg-neutral-100'} transition-colors`;
        btn.disabled = disabled;
        if (!disabled) btn.addEventListener('click', () => fetchOrders(page));
        return btn;
    }

    // ===== ORDER DETAIL MODAL =====
    async function openDetail(orderId) {
        const modal = $('order-detail-modal');
        modal.classList.remove('hidden');
        $('modal-loading').classList.remove('hidden');
        $('modal-body').classList.add('hidden');
        document.body.style.overflow = 'hidden';

        try {
            const res = await fetch(`${API.DETAIL(orderId)}?_t=${new Date().getTime()}`);
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/admin/login';
                return;
            }
            if (!res.ok) throw new Error('Lỗi khi tải chi tiết đơn hàng');
            const order = await res.json();

            $('modal-order-id').textContent = `Đơn hàng #ORD-${String(order.orderId).padStart(4, '0')}`;
            $('modal-order-date').textContent = `Ngày đặt: ${formatDateTime(order.orderDate)}`;
            $('modal-total').textContent = formatCurrency(order.totalAmount);
            $('modal-payment').textContent = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod;

            // Parse shipping address: "Tên | SĐT | Địa chỉ"
            const addressParts = (order.shippingAddress || '').split('|').map(s => s.trim());
            $('modal-receiver-name').textContent = addressParts[0] || '—';
            $('modal-receiver-phone').textContent = addressParts[1] || '—';
            $('modal-receiver-address').textContent = addressParts.slice(2).join(', ') || '—';

            renderOrderItems(order.items, order.orderId);

            $('modal-loading').classList.add('hidden');
            $('modal-body').classList.remove('hidden');
        } catch (err) {
            showToast(err.message, 'error');
            closeModal();
        }
    }

    function renderOrderItems(items, orderId) {
        const container = $('modal-items');
        container.innerHTML = items.map(item => {
            const transitions = STATUS_TRANSITIONS[item.status] || [];
            const statusOptions = transitions.map(s =>
                `<option value="${s}">${STATUS_LABELS[s]}</option>`
            ).join('');

            const hasActions = transitions.length > 0;

            return `<div class="border border-neutral-100 p-4">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                        <p class="text-[12px] font-bold text-primary truncate">${item.productName}</p>
                        <div class="flex items-center gap-3 mt-1.5 text-[10px] text-neutral-400 font-medium">
                            ${item.size ? `<span>Size: <strong class="text-neutral-600">${item.size}</strong></span>` : ''}
                            ${item.color ? `<span>Màu: <strong class="text-neutral-600">${item.color}</strong></span>` : ''}
                            <span>SL: <strong class="text-neutral-600">${item.quantity}</strong></span>
                        </div>
                    </div>
                    <p class="text-[12px] font-black text-primary whitespace-nowrap">${formatCurrency(item.price * item.quantity)}</p>
                </div>

                <div class="mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <div class="flex items-center gap-2">
                        ${renderStatusBadge(item.status)}
                        ${item.refundStatus ? `<span class="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 uppercase tracking-widest">Hoàn: ${item.refundStatus}</span>` : ''}
                    </div>
                    ${hasActions ? `
                    <div class="flex items-center gap-1.5">
                        <select id="item-status-${item.orderItemId}" class="px-2 py-1 text-[10px] font-medium border border-neutral-200 bg-neutral-50 outline-none">
                            <option value="">Chuyển trạng thái...</option>
                            ${statusOptions}
                        </select>
                        <button onclick="AdminOrders.updateItemStatus(${item.orderItemId})"
                                class="bg-primary text-white px-2.5 py-1 text-[9px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors">
                            Cập nhật
                        </button>
                    </div>` : ''}
                </div>

                ${item.histories && item.histories.length > 0 ? `
                <details class="mt-3">
                    <summary class="text-[9px] font-bold text-neutral-400 uppercase tracking-widest cursor-pointer hover:text-accent transition-colors">
                        Lịch sử trạng thái (${item.histories.length})
                    </summary>
                    <div class="mt-2 space-y-1.5 pl-3 border-l-2 border-neutral-100">
                        ${item.histories.map(h => `
                            <div class="text-[10px] text-neutral-500">
                                <span class="font-bold">${STATUS_LABELS[h.previousStatus] || h.previousStatus}</span>
                                <span class="material-symbols-outlined text-[10px] align-middle mx-0.5">arrow_forward</span>
                                <span class="font-bold text-primary">${STATUS_LABELS[h.newStatus] || h.newStatus}</span>
                                <span class="text-neutral-300 ml-1">${formatDateTime(h.changeDate)}</span>
                            </div>
                        `).join('')}
                    </div>
                </details>` : ''}

                ${item.cancellationReason ? `
                <div class="mt-2 text-[10px] text-red-500 font-medium">
                    <span class="font-bold">Lý do hủy:</span> ${item.cancellationReason}
                </div>` : ''}
            </div>`;
        }).join('');
    }

    function closeModal() {
        $('order-detail-modal').classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ===== UPDATE ITEM STATUS =====
    async function updateItemStatus(itemId) {
        const select = $(`item-status-${itemId}`);
        const newStatus = select.value;
        if (!newStatus) {
            showToast('Vui lòng chọn trạng thái mới', 'warning');
            return;
        }

        try {
            const res = await fetch(`${API.UPDATE_ITEM_STATUS(itemId)}?status=${newStatus}`, {
                method: 'PATCH',
            });
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/admin/login';
                return;
            }
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Cập nhật thất bại');
            }

            showToast('Cập nhật trạng thái thành công!');

            // Reload modal content
            const orderIdText = $('modal-order-id').textContent;
            const match = orderIdText.match(/#ORD-(\d+)/);
            if (match) {
                const orderId = parseInt(match[1]);
                await openDetail(orderId);
            }

            // Refresh table
            fetchOrders(currentPage);
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    // ===== INIT =====
    function init() {
        // Filter inputs (Automatic filtering)
        $('filter-status').addEventListener('change', () => fetchOrders(0));
        $('filter-start-date').addEventListener('change', () => fetchOrders(0));
        $('filter-end-date').addEventListener('change', () => fetchOrders(0));

        $('btn-reset-filter').addEventListener('click', () => {
            $('filter-status').value = '';
            $('filter-start-date').value = '';
            $('filter-end-date').value = '';
            fetchOrders(0);
        });

        // Close modal on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        // Load initial data
        fetchOrders(0);

        // Check for orderId in URL to open detail modal automatically (from Returns page)
        const urlParams = new URLSearchParams(window.location.search);
        const autoOrderId = urlParams.get('orderId');
        if (autoOrderId) {
            setTimeout(() => openDetail(autoOrderId), 500);
        }
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return { openDetail, closeModal, updateItemStatus };
})();
