/**
 * Admin Reports — H&Y Fashion Store
 * Gọi API từ ReportController để hiển thị báo cáo doanh thu.
 * API: GET /api/admin/reports/revenue?startDate=&endDate=
 * Export: GET /api/admin/reports/revenue/export?startDate=&endDate=&format=csv
 */
const AdminReports = (() => {

    // ===== CONFIG =====
    const API = {
        REVENUE: '/api/admin/reports/revenue',
        EXPORT:  '/api/admin/reports/revenue/export',
    };

    // Store the last fetched report & current filter tab
    let reportData = null;
    let currentTab = 'ALL'; // ALL | ONLINE | OFFLINE
    let datePickerInstance = null;

    // ===== DOM REF =====
    const $ = (id) => document.getElementById(id);

    // ===== UTILITY =====
    function formatCurrency(amount) {
        if (amount == null || isNaN(amount)) return '0₫';
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function toPercent(part, total) {
        if (!total || total === 0) return '0';
        return ((part / total) * 100).toFixed(1);
    }

    function showToast(message, type = 'success') {
        const container = $('admin-toast');
        const colors = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-amber-600';
        const icon   = type === 'success' ? 'check_circle'   : type === 'error' ? 'error'         : 'warning';
        const toast  = document.createElement('div');
        toast.className = `${colors} text-white px-4 py-3 text-[11px] font-bold flex items-center gap-2 shadow-lg transition-all duration-300`;
        toast.innerHTML = `<span class="material-symbols-outlined text-[16px]">${icon}</span>${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-4');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    function getDateRange() {
        if (!datePickerInstance) return { startDate: '', endDate: '' };
        const dates = datePickerInstance.selectedDates;
        if (dates.length !== 2) return { startDate: '', endDate: '' };
        return {
            startDate: formatDateInput(dates[0]),
            endDate: formatDateInput(dates[1])
        };
    }

    // ===== PRESET BUTTONS =====
    function applyPreset(days) {
        const now   = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - days + (days === 1 ? 0 : 1));
        const finalStart = days === 1 ? now : start;

        // Highlight active preset
        document.querySelectorAll('.preset-btn').forEach(b => {
            b.classList.remove('bg-primary', 'text-white', 'border-primary');
            b.classList.add('border-neutral-200', 'text-neutral-500');
        });
        const presetId = days === 1 ? 'preset-today' : days === 7 ? 'preset-week' : days === 30 ? 'preset-month' : 'preset-quarter';
        const active = $(presetId);
        if (active) {
            active.classList.add('bg-primary', 'text-white', 'border-primary');
            active.classList.remove('text-neutral-500', 'border-neutral-200');
        }

        if (datePickerInstance) {
            datePickerInstance.setDate([finalStart, now], false); // false to not trigger onChange
        }

        loadReport();
    }

    function formatDateInput(d) {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${mm}-${dd}`;
    }

    // ===== FETCH REPORT =====
    async function loadReport() {
        const { startDate, endDate } = getDateRange();

        if (!startDate || !endDate) {
            showToast('Vui lòng chọn khoảng thời gian', 'warning');
            return;
        }
        if (startDate > endDate) {
            showToast('Ngày bắt đầu phải trước ngày kết thúc', 'warning');
            return;
        }

        // Show loading
        $('report-loading').classList.remove('hidden');
        $('report-empty').classList.add('hidden');
        $('report-content').classList.add('hidden');
        $('btn-export-csv').disabled = true;

        try {
            const params = new URLSearchParams({ startDate, endDate });
            const res = await fetch(`${API.REVENUE}?${params}&_t=${Date.now()}`);

            if (res.status === 401 || res.status === 403) {
                window.location.href = '/admin/login';
                return;
            }
            if (!res.ok) throw new Error('Không thể tải báo cáo. Vui lòng thử lại.');

            reportData = await res.json();

            $('report-loading').classList.add('hidden');
            renderReport(reportData);
            $('btn-export-csv').disabled = false;

        } catch (err) {
            $('report-loading').classList.add('hidden');
            $('report-empty').classList.remove('hidden');
            showToast(err.message, 'error');
        }
    }

    // ===== RENDER KPIs =====
    function renderReport(data) {
        const online  = data.onlineRevenue  || 0;
        const offline = data.offlineRevenue || 0;
        const total   = online + offline;

        // KPI Cards
        $('kpi-total').textContent   = formatCurrency(total);
        $('kpi-online').textContent  = formatCurrency(online);
        $('kpi-offline').textContent = formatCurrency(offline);
        $('kpi-orders').textContent  = data.totalOrders ?? 0;

        const onlinePct  = toPercent(online,  total);
        const offlinePct = toPercent(offline, total);
        $('kpi-online-pct').textContent  = `${onlinePct}% tổng`;
        $('kpi-offline-pct').textContent = `${offlinePct}% tổng`;

        const avgOrder = data.totalOrders > 0 ? total / data.totalOrders : 0;
        $('kpi-avg').textContent = `TB: ${formatCurrency(avgOrder)}/đơn`;

        // Revenue bar (animate after tiny delay)
        setTimeout(() => {
            $('bar-online').style.width  = `${onlinePct}%`;
            $('bar-offline').style.width = `${offlinePct}%`;
        }, 80);

        // Table
        currentTab = 'ALL';
        syncTabButtons('ALL');
        renderTable(data.orders || []);

        // Show content
        $('report-content').classList.remove('hidden');
    }

    // ===== RENDER TABLE =====
    function renderTable(orders) {
        const filtered = currentTab === 'ALL'
            ? orders
            : orders.filter(o => (o.type || '').toUpperCase() === currentTab);

        const tbody = $('orders-table-body');
        $('table-count').textContent = filtered.length;

        if (filtered.length === 0) {
            tbody.innerHTML = '';
            $('table-empty').classList.remove('hidden');
            return;
        }
        $('table-empty').classList.add('hidden');

        tbody.innerHTML = filtered.map((order, idx) => {
            const isOnline = (order.type || '').toUpperCase() === 'ONLINE';
            const typeBadge = isOnline
                ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-600 uppercase tracking-widest"><span class="w-1 h-1 rounded-full bg-blue-500"></span>Online</span>`
                : `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-600 uppercase tracking-widest"><span class="w-1 h-1 rounded-full bg-amber-400"></span>Offline</span>`;

            const itemCount = (order.items || []).length;

            return `<tr class="hover:bg-neutral-50/50 transition-colors">
                <td class="px-5 py-3.5 text-[12px] font-bold text-primary">#ORD-${String(order.orderId).padStart(4, '0')}</td>
                <td class="px-5 py-3.5 text-[12px] text-neutral-500 font-medium">${formatDate(order.orderDate)}</td>
                <td class="px-5 py-3.5 text-center">${typeBadge}</td>
                <td class="px-5 py-3.5 text-[12px] font-bold text-neutral-700 text-center">${itemCount}</td>
                <td class="px-5 py-3.5 text-[12px] font-black text-primary text-right">${formatCurrency(order.totalAmount)}</td>
                <td class="px-5 py-3.5 text-center">
                    <button onclick="AdminReports.openPanel(${idx})"
                            class="text-neutral-400 hover:text-accent transition-colors"
                            title="Xem chi tiết">
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                </td>
            </tr>`;
        }).join('');
    }

    // ===== TAB BUTTONS =====
    function syncTabButtons(active) {
        const tabs = {
            'ALL':     'tab-all',
            'ONLINE':  'tab-online',
            'OFFLINE': 'tab-offline',
        };
        Object.entries(tabs).forEach(([key, id]) => {
            const btn = $(id);
            if (!btn) return;
            if (key === active) {
                btn.className = 'tab-btn px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-primary text-white transition-colors';
            } else {
                btn.className = 'tab-btn px-3 py-1 text-[9px] font-black uppercase tracking-widest text-neutral-500 border border-neutral-200 hover:border-primary hover:text-primary transition-colors';
            }
        });
    }

    function switchTab(tab) {
        currentTab = tab;
        syncTabButtons(tab);
        if (reportData) renderTable(reportData.orders || []);
    }

    // ===== ORDER DETAIL PANEL =====
    function openPanel(idx) {
        if (!reportData || !reportData.orders) return;

        // Re-build filtered list to match table rows
        const filtered = currentTab === 'ALL'
            ? reportData.orders
            : reportData.orders.filter(o => (o.type || '').toUpperCase() === currentTab);

        const order = filtered[idx];
        if (!order) return;

        const isOnline = (order.type || '').toUpperCase() === 'ONLINE';

        $('panel-order-id').textContent   = `Đơn hàng #ORD-${String(order.orderId).padStart(4, '0')}`;
        $('panel-order-date').textContent = `Ngày: ${formatDate(order.orderDate)}`;
        $('panel-total').textContent      = formatCurrency(order.totalAmount);
        $('panel-type').innerHTML         = isOnline
            ? `<span class="text-blue-600">🌐 Online</span>`
            : `<span class="text-amber-600">🏪 Offline</span>`;

        const items = order.items || [];
        $('panel-items').innerHTML = items.length === 0
            ? `<p class="text-[11px] text-neutral-400">Không có dữ liệu sản phẩm</p>`
            : items.map(item => `
                <div class="flex items-center justify-between py-2.5 border-b border-neutral-50 last:border-0">
                    <div class="flex-1 min-w-0">
                        <p class="text-[12px] font-bold text-primary truncate">${item.productName || '—'}</p>
                        <p class="text-[10px] text-neutral-400 font-medium mt-0.5">SL: <strong class="text-neutral-600">${item.quantity}</strong> × ${formatCurrency(item.price)}</p>
                    </div>
                    <p class="text-[12px] font-black text-primary whitespace-nowrap ml-3">${formatCurrency((item.price || 0) * (item.quantity || 0))}</p>
                </div>`).join('');

        $('order-panel').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closePanel() {
        $('order-panel').classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ===== EXPORT =====
    async function exportCsv() {
        const { startDate, endDate } = getDateRange();
        if (!startDate || !endDate) {
            showToast('Chọn khoảng thời gian trước khi xuất', 'warning');
            return;
        }

        const btn = $('btn-export-csv');
        btn.disabled = true;
        btn.innerHTML = `<span class="material-symbols-outlined text-[14px] animate-spin">sync</span> Đang xuất...`;

        try {
            const params = new URLSearchParams({ startDate, endDate, format: 'csv' });
            const res = await fetch(`${API.EXPORT}?${params}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Xuất file thất bại');
            }

            const blob = await res.blob();
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `revenue-report-${startDate}-to-${endDate}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            showToast('Xuất CSV thành công!');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<span class="material-symbols-outlined text-[14px]">download</span> Xuất CSV`;
        }
    }

    // ===== INIT =====
    function init() {
        // Init Flatpickr
        datePickerInstance = flatpickr("#filter-date-range", {
            mode: "range",
            dateFormat: "d/m/Y",
            locale: "vn",
            onChange: function(selectedDates) {
                // Remove active styling from presets if manually interacted
                document.querySelectorAll('.preset-btn').forEach(b => {
                    b.classList.remove('bg-primary', 'text-white', 'border-primary');
                    b.classList.add('border-neutral-200', 'text-neutral-500');
                });
                // Auto-load if full range is selected
                if (selectedDates.length === 2) {
                    loadReport();
                }
            }
        });

        // Preset buttons
        $('preset-today')   .addEventListener('click', () => applyPreset(1));
        $('preset-week')    .addEventListener('click', () => applyPreset(7));
        $('preset-month')   .addEventListener('click', () => applyPreset(30));
        $('preset-quarter') .addEventListener('click', () => applyPreset(90));

        // Load report button
        $('btn-load-report').addEventListener('click', loadReport);

        // Tab buttons
        $('tab-all')    .addEventListener('click', () => switchTab('ALL'));
        $('tab-online') .addEventListener('click', () => switchTab('ONLINE'));
        $('tab-offline').addEventListener('click', () => switchTab('OFFLINE'));

        // Export
        $('btn-export-csv').addEventListener('click', exportCsv);

        // Close panel on ESC
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closePanel();
        });

        // Default: auto-load last 30 days
        applyPreset(30);
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return { openPanel, closePanel };
})();
