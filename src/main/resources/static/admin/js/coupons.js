/**
 * Admin Coupons Management — H&Y Fashion Store
 * Quản lý Chương trình Khuyến mãi
 */
const AdminCoupons = (() => {

    // ===== CONFIG =====
    const API = {
        LIST: '/api/admin/coupons',
        DETAIL: (id) => `/api/admin/coupons/${id}`,
        CREATE: '/api/admin/coupons',
        UPDATE: (id) => `/api/admin/coupons/${id}`,
        TOGGLE: (id) => `/api/admin/coupons/${id}/toggle-status`,
    };

    const PAGE_SIZE = 10;
    let currentPage = 0;

    // ===== DOM REFERENCES =====
    const $ = (id) => document.getElementById(id);

    // ===== UTILITY FUNCTIONS =====
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    }

    // Convert ISO string to local datetime-local input format (YYYY-MM-DDTHH:mm)
    function formatToInputDate(isoStr) {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function formatDisplayDate(isoStr) {
        if (!isoStr) return '—';
        return new Date(isoStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function showToast(message, type = 'success') {
        const container = $('admin-toast');
        const colors = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-amber-600';
        const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'warning';
        const toast = document.createElement('div');
        toast.className = `${colors} text-white px-4 py-3 text-[11px] font-bold flex items-center gap-2 shadow-lg transition-all duration-300 transform translate-x-0`;
        toast.innerHTML = `<span class="material-symbols-outlined text-[16px]">${icon}</span>${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-4');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== FETCH DATA =====
    async function fetchCoupons(page = 0) {
        const keyword = $('filter-keyword').value.trim();
        const params = new URLSearchParams({
            page,
            size: PAGE_SIZE,
            sort: 'startDate,desc'
        });
        if (keyword) params.append('keyword', keyword);

        $('coupons-loading').classList.remove('hidden');
        $('coupons-empty').classList.add('hidden');
        $('coupons-table-body').innerHTML = '';
        $('coupons-pagination').classList.add('hidden');

        try {
            const res = await fetch(`${API.LIST}?${params.toString()}`);
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/admin/login';
                return;
            }
            if (!res.ok) throw new Error('Lỗi khi tải danh sách mã giảm giá');
            const data = await res.json();

            $('coupons-loading').classList.add('hidden');

            if (!data.content || data.content.length === 0) {
                $('coupons-empty').classList.remove('hidden');
                return;
            }

            renderTable(data.content);
            renderPagination(data);
            currentPage = data.number;
        } catch (err) {
            $('coupons-loading').classList.add('hidden');
            showToast(err.message, 'error');
        }
    }

    // ===== RENDER TABLE =====
    function renderTable(coupons) {
        const tbody = $('coupons-table-body');
        tbody.innerHTML = coupons.map(c => {
            const discountLabel = c.discountType === 'PERCENTAGE' 
                ? `<span class="text-emerald-600 font-black">-${c.discountValue}%</span>`
                : `<span class="text-primary font-black">-${formatCurrency(c.discountValue)}</span>`;

            const statusClass = c.active 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-red-50 text-red-600';
            const statusLabel = c.active ? 'Hoạt động' : 'Tạm dừng';

            return `<tr class="hover:bg-neutral-50/50 transition-colors cursor-pointer" onclick="AdminCoupons.openEdit(${c.couponId})">
                <td class="px-5 py-4">
                    <span class="text-[12px] font-black text-primary tracking-widest border border-neutral-100 px-2 py-1 bg-neutral-50">${c.code}</span>
                </td>
                <td class="px-5 py-4 text-[12px] font-medium">${discountLabel}</td>
                <td class="px-5 py-4">
                    <div class="flex flex-col">
                        <span class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Hạn dùng</span>
                        <span class="text-[11px] font-medium text-neutral-600">${formatDisplayDate(c.expiryDate)}</span>
                    </div>
                </td>
                <td class="px-5 py-4 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${statusClass}">
                        ${statusLabel}
                    </span>
                </td>
                <td class="px-5 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="event.stopPropagation(); AdminCoupons.toggleStatus(${c.couponId})" 
                                class="text-neutral-400 hover:text-primary transition-colors" title="Bật/Tắt">
                            <span class="material-symbols-outlined text-[18px]">${c.active ? 'pause_circle' : 'play_circle'}</span>
                        </button>
                        <button onclick="event.stopPropagation(); AdminCoupons.openEdit(${c.couponId})" 
                                class="text-neutral-400 hover:text-accent transition-colors" title="Sửa">
                            <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    // ===== PAGINATION =====
    function renderPagination(pageData) {
        const container = $('coupons-pagination');
        container.classList.remove('hidden');

        const start = pageData.number * pageData.size + 1;
        const end = Math.min(start + pageData.numberOfElements - 1, pageData.totalElements);
        $('pagination-info').textContent = `Hiển thị ${start}–${end} / ${pageData.totalElements} mã`;

        const btns = $('pagination-buttons');
        btns.innerHTML = '';

        btns.appendChild(createPageBtn('chevron_left', pageData.number - 1, pageData.first));
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
            btn.addEventListener('click', () => fetchCoupons(i));
            btns.appendChild(btn);
        }
        btns.appendChild(createPageBtn('chevron_right', pageData.number + 1, pageData.last));
    }

    function createPageBtn(icon, page, disabled) {
        const btn = document.createElement('button');
        btn.innerHTML = `<span class="material-symbols-outlined text-[16px]">${icon}</span>`;
        btn.className = `w-8 h-8 flex items-center justify-center ${disabled ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-500 hover:bg-neutral-100'} transition-colors`;
        btn.disabled = disabled;
        if (!disabled) btn.addEventListener('click', () => fetchCoupons(page));
        return btn;
    }

    // ===== MODAL LOGIC =====
    function openCreate() {
        $('modal-title').textContent = 'Tạo Mã Giảm Giá';
        $('coupon-form').reset();
        $('form-coupon-id').value = '';
        $('form-active').checked = true;
        $('coupon-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    async function openEdit(id) {
        try {
            const res = await fetch(API.DETAIL(id));
            if (!res.ok) throw new Error('Lỗi khi tải chi tiết mã giảm giá');
            const c = await res.json();

            $('modal-title').textContent = 'Cập Nhật Mã Giảm Giá';
            $('form-coupon-id').value = c.couponId;
            $('form-code').value = c.code;
            $('form-discount-type').value = c.discountType;
            $('form-discount-value').value = c.discountValue;
            $('form-min-order').value = c.minOrderAmount || 0;
            // Note: backend may not provide all fields in detail, ensure DTO is complete or Fetch Entity
            // For now assume standard fields are there
            $('form-usage-limit').value = c.usageLimit || '';
            $('form-start-date').value = formatToInputDate(c.startDate);
            $('form-expiry-date').value = formatToInputDate(c.expiryDate);
            $('form-active').checked = c.active;

            $('coupon-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    function closeModal() {
        $('coupon-modal').classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ===== FORM SUBMIT =====
    async function handleSubmit(e) {
        e.preventDefault();

        const id = $('form-coupon-id').value;
        const discountValue = parseFloat($('form-discount-value').value);
        const minOrder = parseFloat($('form-min-order').value) || 0;
        const usageLimitVal = parseInt($('form-usage-limit').value);
        
        const data = {
            code: $('form-code').value.trim().toUpperCase(),
            discountType: $('form-discount-type').value,
            discountValue: isNaN(discountValue) ? 0 : discountValue,
            startDate: new Date($('form-start-date').value).toISOString(),
            expiryDate: new Date($('form-expiry-date').value).toISOString(),
            minOrderAmount: isNaN(minOrder) ? 0 : minOrder,
            active: $('form-active').checked
        };
        
        if (!isNaN(usageLimitVal)) data.usageLimit = usageLimitVal;

        // Debug log
        console.log('Sending Coupon Data:', JSON.stringify(data, null, 2));

        // Validation
        if (!data.code || data.code.length < 3) {
            showToast('Mã code phải từ 3 ký tự trở lên', 'error');
            return;
        }
        if (data.discountValue <= 0) {
            showToast('Giá trị giảm phải lớn hơn 0', 'error');
            return;
        }

        const btn = $('btn-submit');
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined text-[14px] animate-spin">sync</span> Đang lưu...';

        try {
            const url = id ? API.UPDATE(id) : API.CREATE;
            const method = id ? 'PUT' : 'POST';

            console.log(`Request: ${method} ${url}`);

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                console.error('Coupon API Error:', errData);
                
                let errorMsg = errData.message || 'Lỗi dữ liệu không hợp lệ';
                
                if (errData.errors && Array.isArray(errData.errors)) {
                    errorMsg = errData.errors[0];
                } else if (typeof errData === 'object' && !errData.message) {
                    // Xử lý Map lỗi từ Spring Validation
                    const errorValues = Object.values(errData);
                    if (errorValues.length > 0) errorMsg = errorValues[0];
                }
                
                throw new Error(errorMsg);
            }

            showToast(id ? 'Cập nhật thành công!' : 'Tạo mã mới thành công!');
            closeModal();
            fetchCoupons(id ? currentPage : 0);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
        }
    }

    async function toggleStatus(id) {
        try {
            const res = await fetch(API.TOGGLE(id), { method: 'PATCH' });
            if (!res.ok) throw new Error('Cập nhật trạng thái thất bại');
            
            showToast('Cập nhật trạng thái thành công!');
            fetchCoupons(currentPage);
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    // ===== DEBOUNCE HELPER =====
    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    const debouncedFetch = debounce(() => fetchCoupons(0));

    // ===== INIT =====
    function init() {
        $('btn-add-coupon').addEventListener('click', openCreate);
        $('filter-keyword').addEventListener('input', debouncedFetch);
        $('btn-reset-filter').addEventListener('click', () => {
            $('filter-keyword').value = '';
            fetchCoupons(0);
        });
        $('coupon-form').addEventListener('submit', handleSubmit);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        fetchCoupons(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { openEdit, closeModal, toggleStatus };
})();
