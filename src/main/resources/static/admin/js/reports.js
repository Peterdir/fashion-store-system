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
    let revenueChartInstance = null; // Thêm instance cho chart
    
    // Pagination state
    let currentPage = 1;
    const itemsPerPage = 10;

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
        return {
            startDate: $('filter-start-date').value,
            endDate: $('filter-end-date').value
        };
    }

    // ===== PRESET BUTTONS =====
    function applyPreset(presetType) {
        const now = new Date();
        let start, end;
        
        if (presetType === 'today') {
            start = new Date(now);
            end = new Date(now);
        } else if (presetType === 'week') {
            start = new Date(now);
            start.setDate(now.getDate() - 6);
            end = new Date(now);
        } else if (presetType === 'this-month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now);
        } else if (presetType === 'last-month') {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
        }

        // Highlight active preset
        document.querySelectorAll('.preset-btn').forEach(b => {
            b.classList.remove('bg-primary', 'text-white', 'border-primary');
            b.classList.add('border-neutral-200', 'text-neutral-500');
        });
        const active = $('preset-' + presetType);
        if (active) {
            active.classList.add('bg-primary', 'text-white', 'border-primary');
            active.classList.remove('text-neutral-500', 'border-neutral-200');
        }

        $('filter-start-date').value = formatDateInput(start);
        $('filter-end-date').value = formatDateInput(end);

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
            currentPage = 1; // Reset trang khi tải dữ liệu mới
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

        // Hiển thị biểu đồ (truyền raw orders vào)
        renderChart(data.orders || []);

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
        const countSpan = $('table-count');
        const emptyDiv = $('table-empty');
        const pgnContainer = $('pagination-container');
        const pgnInfo = $('pagination-info');
        const pgnControls = $('pagination-controls');

        countSpan.textContent = filtered.length;

        if (filtered.length === 0) {
            tbody.innerHTML = '';
            emptyDiv.classList.remove('hidden');
            pgnContainer.classList.add('hidden');
            return;
        }
        emptyDiv.classList.add('hidden');

        // Pagination Logic
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
        const currentSlice = filtered.slice(startIndex, endIndex);

        tbody.innerHTML = currentSlice.map((order, indexInSlice) => {
            const actualIndex = startIndex + indexInSlice; // original index cho việc mở Panel
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
                    <button onclick="AdminReports.openPanel(${actualIndex})"
                            class="text-neutral-400 hover:text-accent transition-colors"
                            title="Xem chi tiết">
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                </td>
            </tr>`;
        }).join('');

        // Render Pagination Controls
        if (totalPages > 1) {
            pgnInfo.textContent = `Đang xem từ ${startIndex + 1} đến ${endIndex} trên ${totalItems} đơn hàng`;
            pgnContainer.classList.remove('hidden');

            let pgnHtml = `
                <button onclick="AdminReports.goToPage(${currentPage - 1})" 
                        class="w-7 h-7 flex items-center justify-center rounded border ${currentPage === 1 ? 'border-neutral-100 text-neutral-300 cursor-not-allowed' : 'border-neutral-200 text-neutral-500 hover:border-primary hover:text-primary transition-colors bg-white'}"
                        ${currentPage === 1 ? 'disabled' : ''}>
                    <span class="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
            `;

            for (let i = 1; i <= totalPages; i++) {
                if (totalPages > 7) {
                    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                        pgnHtml += createPageBtn(i, currentPage);
                    } else if (i === currentPage - 2 || i === currentPage + 2) {
                        pgnHtml += `<span class="text-neutral-400 text-[10px] px-1 font-bold">...</span>`;
                    }
                } else {
                    pgnHtml += createPageBtn(i, currentPage);
                }
            }

            pgnHtml += `
                <button onclick="AdminReports.goToPage(${currentPage + 1})" 
                        class="w-7 h-7 flex items-center justify-center rounded border ${currentPage === totalPages ? 'border-neutral-100 text-neutral-300 cursor-not-allowed' : 'border-neutral-200 text-neutral-500 hover:border-primary hover:text-primary transition-colors bg-white'}"
                        ${currentPage === totalPages ? 'disabled' : ''}>
                    <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
            `;
            pgnControls.innerHTML = pgnHtml;
        } else {
            pgnContainer.classList.add('hidden');
        }
    }

    function createPageBtn(pageIdx, currentIdx) {
        if (pageIdx === currentIdx) {
            return `<button class="w-7 h-7 flex items-center justify-center rounded bg-primary text-white text-[11px] font-bold">${pageIdx}</button>`;
        }
        return `<button onclick="AdminReports.goToPage(${pageIdx})" class="w-7 h-7 flex items-center justify-center rounded border border-neutral-200 bg-white text-neutral-500 text-[11px] font-medium hover:border-primary hover:text-primary transition-colors">${pageIdx}</button>`;
    }

    function goToPage(page) {
        currentPage = page;
        if (reportData) renderTable(reportData.orders || []);
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

    // ===== RENDER CHART =====
    function renderChart(orders) {
        const ctx = $('revenueChart');
        if (!ctx) return;

        if (revenueChartInstance) {
            revenueChartInstance.destroy();
        }

        const { startDate, endDate } = getDateRange();
        if (!startDate || !endDate) return;

        const parseDateSplit = (dateStr) => {
            const [y, m, d] = dateStr.split('-');
            return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 0, 0, 0);
        };

        const start = parseDateSplit(startDate);
        const end = parseDateSplit(endDate);
        const datesMap = {};
        
        let current = new Date(start);
        while(current <= end) {
            const dateStr = formatDateInput(current);
            datesMap[dateStr] = { online: 0, offline: 0 };
            current.setDate(current.getDate() + 1);
        }

        orders.forEach(o => {
            if(!o.orderDate) return;
            const d = new Date(o.orderDate);
            if(isNaN(d)) return;
            const dateStr = formatDateInput(d);
            
            if (datesMap[dateStr] !== undefined) {
                const isOnline = (o.type || '').toUpperCase() === 'ONLINE';
                if (isOnline) {
                    datesMap[dateStr].online += o.totalAmount || 0;
                } else {
                    datesMap[dateStr].offline += o.totalAmount || 0;
                }
            }
        });

        const labels = Object.keys(datesMap).map(d => {
            const arr = d.split('-');
            return `${arr[2]}/${arr[1]}`;
        });
        const onlineData = Object.values(datesMap).map(v => v.online);
        const offlineData = Object.values(datesMap).map(v => v.offline);

        revenueChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Online',
                        data: onlineData,
                        backgroundColor: '#3b82f6',
                        barPercentage: 0.7,
                        categoryPercentage: 0.7
                    },
                    {
                        label: 'Offline',
                        data: offlineData,
                        backgroundColor: '#fbbf24',
                        barPercentage: 0.7,
                        categoryPercentage: 0.7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 6,
                            font: { family: 'Inter', size: 10, weight: '600' },
                            padding: 10
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#171717',
                        padding: 12,
                        titleFont: { family: 'Inter', size: 12 },
                        bodyFont: { family: 'Inter', size: 11 },
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('vi-VN').format(context.parsed.y) + '₫';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false },
                        ticks: { font: { family: 'Inter', size: 9 }, color: '#a3a3a3' },
                        border: { display: false }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: { color: '#f5f5f5', borderDash: [4, 4] },
                        ticks: {
                            font: { family: 'Inter', size: 9 },
                            color: '#a3a3a3',
                            callback: function(value) {
                                if (value >= 1000000000) return (value / 1000000000) + ' Tỷ';
                                if (value >= 1000000) return (value / 1000000) + ' Tr';
                                if (value >= 1000) return (value / 1000) + ' K';
                                return value;
                            }
                        },
                        border: { display: false }
                    }
                },
                interaction: {
                    mode: 'index',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    function switchTab(tab) {
        currentTab = tab;
        currentPage = 1; // Khởi động lại về trang 1
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
        // Preset buttons
        $('preset-today')      .addEventListener('click', () => applyPreset('today'));
        $('preset-week')       .addEventListener('click', () => applyPreset('week'));
        $('preset-this-month') .addEventListener('click', () => applyPreset('this-month'));
        $('preset-last-month') .addEventListener('click', () => applyPreset('last-month'));

        // Reset preset state if manually modify native date input
        const clearPresets = () => {
             document.querySelectorAll('.preset-btn').forEach(b => {
                 b.classList.remove('bg-primary', 'text-white', 'border-primary');
                 b.classList.add('border-neutral-200', 'text-neutral-500');
             });
        };
        $('filter-start-date').addEventListener('change', clearPresets);
        $('filter-end-date').addEventListener('change', clearPresets);

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

        // Default: This month
        applyPreset('this-month');
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return { openPanel, closePanel, goToPage };
})();
