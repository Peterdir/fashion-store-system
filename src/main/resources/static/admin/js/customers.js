/**
 * Admin Customers Management — H&Y Fashion Store
 * Gọi API từ AdminUserController để quản lý người dùng.
 */
const AdminCustomers = (() => {

    // ===== CONFIG =====
    const API = {
        LIST: '/api/admin/customers',
        DETAIL: (id) => `/api/admin/customers/${id}`,
        UPDATE_STATUS: (id) => `/api/admin/customers/${id}/status`,
    };

    const PAGE_SIZE = 10;
    let currentPage = 0;

    // ===== STATUS MAPS =====
    const STATUS_LABELS = {
        PENDING: 'Chờ XT',
        ACTIVE: 'Hoạt động',
        BLOCKED: 'Đã khóa',
    };

    const STATUS_COLORS = {
        PENDING: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
        ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
        BLOCKED: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
    };

    // ===== DOM REFERENCES =====
    const $ = (id) => document.getElementById(id);

    // ===== UTILITY FUNCTIONS =====
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }

    function renderStatusBadge(status) {
        const c = STATUS_COLORS[status] || STATUS_COLORS.BLOCKED;
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

    // ===== FETCH CUSTOMERS =====
    async function fetchCustomers(page = 0) {
        const keyword = $('filter-keyword').value.trim();

        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', PAGE_SIZE);
        params.append('sort', 'id,desc');
        if (keyword) params.append('keyword', keyword);

        $('customers-loading').classList.remove('hidden');
        $('customers-empty').classList.add('hidden');
        $('customers-table-body').innerHTML = '';
        $('customers-pagination').classList.add('hidden');

        try {
            const res = await fetch(`${API.LIST}?${params.toString()}&_t=${new Date().getTime()}`);
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/admin/login';
                return;
            }
            if (!res.ok) throw new Error('Lỗi khi tải danh sách khách hàng');
            const data = await res.json();

            $('customers-loading').classList.add('hidden');

            if (!data.content || data.content.length === 0) {
                $('customers-empty').classList.remove('hidden');
                return;
            }

            renderTable(data.content);
            renderPagination(data);
            currentPage = data.number;
        } catch (err) {
            $('customers-loading').classList.add('hidden');
            $('customers-empty').classList.remove('hidden');
            showToast(err.message, 'error');
        }
    }

    // ===== RENDER TABLE =====
    function renderTable(users) {
        const tbody = $('customers-table-body');
        tbody.innerHTML = users.map(user => {
            return `<tr class="hover:bg-neutral-50/50 transition-colors cursor-pointer" onclick="AdminCustomers.openDetail(${user.userId})">
                <td class="px-5 py-3.5 text-[12px] font-bold text-primary">#USR-${String(user.userId).padStart(4, '0')}</td>
                <td class="px-5 py-3.5">
                    <div class="flex flex-col">
                        <span class="text-[12px] font-bold text-primary">${user.fullName}</span>
                        <span class="text-[10px] text-neutral-400 font-medium">${user.email}</span>
                    </div>
                </td>
                <td class="px-5 py-3.5 text-center">${renderStatusBadge(user.status)}</td>
                <td class="px-5 py-3.5 text-center">
                    <button onclick="event.stopPropagation(); AdminCustomers.openDetail(${user.userId})" class="text-neutral-400 hover:text-accent transition-colors">
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                </td>
            </tr>`;
        }).join('');
    }

    // ===== RENDER PAGINATION =====
    function renderPagination(pageData) {
        const container = $('customers-pagination');
        if (!container) return;
        container.classList.remove('hidden');

        // Hỗ trợ cấu trúc lồng nhau (via-dto)
        const page = pageData.page || pageData;
        const number = page.number || 0;
        const size = page.size || 10;
        const totalElements = page.totalElements || 0;
        const numberOfElements = pageData.numberOfElements || (pageData.content ? pageData.content.length : 0);

        const start = number * size + 1;
        const end = Math.min(start + numberOfElements - 1, totalElements);
        $('pagination-info').textContent = `Hiển thị ${start}–${end} / ${totalElements} khách hàng`;

        const btns = $('pagination-buttons');
        btns.innerHTML = '';

        const current = number;
        const totalPages = page.totalPages || 1;
        const first = page.first !== undefined ? page.first : (number === 0);
        const last = page.last !== undefined ? page.last : (number >= totalPages - 1);

        btns.appendChild(createPageBtn('chevron_left', current - 1, first));

        let startP = Math.max(0, current - 2);
        let endP = Math.min(totalPages - 1, startP + 4);
        startP = Math.max(0, endP - 4);

        for (let i = startP; i <= endP; i++) {
            const btn = document.createElement('button');
            btn.textContent = i + 1;
            btn.className = i === current
                ? 'w-8 h-8 text-[11px] font-black bg-primary text-white'
                : 'w-8 h-8 text-[11px] font-bold text-neutral-500 hover:bg-neutral-100 transition-colors';
            btn.addEventListener('click', () => fetchCustomers(i));
            btns.appendChild(btn);
        }

        btns.appendChild(createPageBtn('chevron_right', current + 1, last));
    }

    function createPageBtn(icon, page, disabled) {
        const btn = document.createElement('button');
        btn.innerHTML = `<span class="material-symbols-outlined text-[16px]">${icon}</span>`;
        btn.className = `w-8 h-8 flex items-center justify-center ${disabled ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-500 hover:bg-neutral-100'} transition-colors`;
        btn.disabled = disabled;
        if (!disabled) btn.addEventListener('click', () => fetchCustomers(page));
        return btn;
    }

    // ===== CUSTOMER DETAIL MODAL =====
    async function openDetail(id) {
        const modal = $('customer-detail-modal');
        modal.classList.remove('hidden');
        $('modal-loading').classList.remove('hidden');
        $('modal-body').classList.add('hidden');
        document.body.style.overflow = 'hidden';

        try {
            const res = await fetch(`${API.DETAIL(id)}?_t=${new Date().getTime()}`);
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/admin/login';
                return;
            }
            if (!res.ok) throw new Error('Lỗi khi tải chi tiết khách hàng');
            const user = await res.json();

            $('modal-customer-id').textContent = `Mã khách hàng #USR-${String(user.userId).padStart(4, '0')}`;
            $('modal-name').textContent = user.fullName || '—';
            $('modal-email').textContent = user.email || '—';
            $('modal-phone').textContent = user.phone || '—';
            $('modal-address').textContent = user.address || 'Chưa cung cấp địa chỉ';
            $('modal-status-badge').innerHTML = renderStatusBadge(user.status);

            // Button Toggle Block
            const isBlocked = user.status === 'BLOCKED';
            const btnBlock = $('btn-toggle-block');
            btnBlock.innerHTML = isBlocked 
                ? '<span class="material-symbols-outlined text-[14px]">lock_open</span> Mở khóa tài khoản'
                : '<span class="material-symbols-outlined text-[14px]">lock</span> Khóa tài khoản';
            btnBlock.className = isBlocked 
                ? 'px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5'
                : 'px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-1.5';
            
            btnBlock.onclick = () => updateStatus(user.userId, isBlocked ? 'ACTIVE' : 'BLOCKED');

            renderOrderHistory(user.orderHistory);

            $('modal-loading').classList.add('hidden');
            $('modal-body').classList.remove('hidden');
        } catch (err) {
            showToast(err.message, 'error');
            closeModal();
        }
    }

    function renderOrderHistory(orders) {
        const container = $('modal-order-history');
        const emptyState = $('modal-history-empty');
        
        if (!orders || orders.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        container.innerHTML = orders.map(o => {
            // Determine dominant status
            const statuses = Object.keys(o.statusSummary || {});
            const status = statuses.length > 0 ? statuses[0] : 'UNKNOWN';

            return `<tr>
                <td class="px-4 py-3 text-[11px] font-bold text-primary">#ORD-${String(o.orderId).padStart(4, '0')}</td>
                <td class="px-4 py-3 text-[10px] text-neutral-500 font-medium">${formatDate(o.orderDate)}</td>
                <td class="px-4 py-3 text-[11px] font-black text-primary text-right">${formatCurrency(o.totalAmount)}</td>
                <td class="px-4 py-3 text-center">
                    <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">${status}</span>
                </td>
            </tr>`;
        }).join('');
    }

    async function updateStatus(id, newStatus) {
        if (!confirm(`Bạn có chắc chắn muốn ${newStatus === 'BLOCKED' ? 'khóa' : 'mở khóa'} tài khoản này?`)) return;

        try {
            const res = await fetch(API.UPDATE_STATUS(id), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.status === 401 || res.status === 403) {
                window.location.href = '/admin/login';
                return;
            }

            if (!res.ok) throw new Error('Cập nhật trạng thái thất bại');

            showToast('Cập nhật trạng thái thành công!');
            openDetail(id); // Reload modal
            fetchCustomers(currentPage); // Reload list
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    function closeModal() {
        $('customer-detail-modal').classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ===== DEBOUNCE HELPER =====
    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    const debouncedFetch = debounce(() => fetchCustomers(0));

    // ===== INIT =====
    function init() {
        $('filter-keyword').addEventListener('input', debouncedFetch);
        
        $('btn-reset-filter').addEventListener('click', () => {
            $('filter-keyword').value = '';
            fetchCustomers(0);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        fetchCustomers(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { openDetail, closeModal };
})();
