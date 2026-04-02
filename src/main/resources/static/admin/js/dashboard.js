/**
 * Dashboard Module — H&Y Admin Panel
 * Kết nối dữ liệu thật từ API /api/admin/dashboard
 */
(function () {
    'use strict';

    // === HELPERS ===
    function formatVND(amount) {
        if (!amount && amount !== 0) return '0 VNĐ';
        return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' VNĐ';
    }

    function formatShortVND(amount) {
        if (!amount) return '0';
        if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + ' tỷ';
        if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + ' tr';
        if (amount >= 1_000) return (amount / 1_000).toFixed(0) + 'k';
        return amount.toString();
    }

    function calcGrowth(current, previous) {
        if (!previous || previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(1);
    }

    function formatDateVN(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // === STATUS LABELS ===
    const STATUS_MAP = {
        'PENDING_CONFIRMATION': { label: 'Chờ xác nhận', color: 'amber' },
        'PENDING_PAYMENT': { label: 'Chờ thanh toán', color: 'amber' },
        'PAID': { label: 'Đã thanh toán', color: 'blue' },
        'PROCESSING': { label: 'Đang xử lý', color: 'blue' },
        'SHIPPING': { label: 'Đang giao', color: 'indigo' },
        'DELIVERED': { label: 'Đã giao', color: 'emerald' },
        'COMPLETED': { label: 'Hoàn thành', color: 'emerald' },
        'CANCELLED': { label: 'Đã hủy', color: 'red' },
        'PAYMENT_FAILED': { label: 'TT thất bại', color: 'red' },
        'PAYMENT_EXPIRED': { label: 'Hết hạn TT', color: 'neutral' },
    };

    function getStatusBadge(status) {
        const s = STATUS_MAP[status] || { label: status, color: 'neutral' };
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold bg-${s.color}-50 text-${s.color}-600 uppercase tracking-widest">
                    <span class="w-1 h-1 rounded-full bg-${s.color}-500"></span> ${s.label}
                </span>`;
    }

    // === COUNT-UP ANIMATION ===
    function animateCount(el, target, duration = 1200, isCurrency = false) {
        const start = 0;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing: ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (target - start) * eased);
            
            el.textContent = isCurrency ? formatShortVND(current) : new Intl.NumberFormat('vi-VN').format(current);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Final value (exact)
                el.textContent = isCurrency ? formatShortVND(target) : new Intl.NumberFormat('vi-VN').format(target);
            }
        }
        requestAnimationFrame(update);
    }

    // === RENDER KPIs ===
    function renderKPIs(data) {
        // Revenue
        const revenueEl = document.getElementById('kpi-revenue');
        const revenueGrowthEl = document.getElementById('kpi-revenue-growth');
        if (revenueEl) animateCount(revenueEl, data.revenueThisMonth || 0, 1500, true);
        if (revenueGrowthEl) {
            const growth = calcGrowth(data.revenueThisMonth, data.revenueLastMonth);
            const isUp = growth >= 0;
            revenueGrowthEl.innerHTML = `
                <span class="${isUp ? 'text-emerald-600' : 'text-red-500'} font-bold flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[12px]">${isUp ? 'arrow_upward' : 'arrow_downward'}</span>${Math.abs(growth)}%
                </span>
                <span class="text-neutral-400">vs tháng trước</span>`;
        }

        // Orders
        const ordersEl = document.getElementById('kpi-orders');
        const ordersGrowthEl = document.getElementById('kpi-orders-growth');
        if (ordersEl) animateCount(ordersEl, data.ordersThisMonth || 0, 1200);
        if (ordersGrowthEl) {
            const growth = calcGrowth(data.ordersThisMonth, data.ordersLastMonth);
            const isUp = growth >= 0;
            ordersGrowthEl.innerHTML = `
                <span class="${isUp ? 'text-emerald-600' : 'text-red-500'} font-bold flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[12px]">${isUp ? 'arrow_upward' : 'arrow_downward'}</span>${Math.abs(growth)}%
                </span>
                <span class="text-neutral-400">vs tháng trước</span>`;
        }

        // Customers
        const customersEl = document.getElementById('kpi-customers');
        if (customersEl) animateCount(customersEl, data.totalCustomers || 0, 1000);

        // Returns
        const returnsEl = document.getElementById('kpi-returns');
        if (returnsEl) animateCount(returnsEl, data.pendingReturns || 0, 800);

        // Products
        const productsEl = document.getElementById('kpi-products');
        if (productsEl) animateCount(productsEl, data.totalProducts || 0, 1000);
    }

    // === RENDER RECENT ORDERS TABLE ===
    function renderRecentOrders(orders) {
        const tbody = document.getElementById('recent-orders-body');
        if (!tbody) return;

        if (!orders || orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="px-5 py-8 text-center text-[11px] text-neutral-400">Chưa có đơn hàng nào</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(o => `
            <tr class="hover:bg-neutral-50/50 transition-colors">
                <td class="px-5 py-3.5 text-[12px] font-bold text-primary">#ORD-${String(o.orderId).padStart(4, '0')}</td>
                <td class="px-5 py-3.5 text-[12px] text-neutral-600">${o.customerName || 'Khách vãng lai'}</td>
                <td class="px-5 py-3.5 text-[12px] font-bold text-primary text-right">${formatVND(o.totalAmount)}</td>
                <td class="px-5 py-3.5 text-center">${getStatusBadge(o.status)}</td>
                <td class="px-5 py-3.5 text-[11px] text-neutral-400 text-center">${formatDateVN(o.orderDate)}</td>
            </tr>
        `).join('');
    }

    // === RENDER TOP PRODUCTS ===
    function renderTopProducts(products) {
        const tbody = document.getElementById('top-products-body');
        if (!tbody) return;

        if (!products || products.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-5 py-8 text-center text-[11px] text-neutral-400">Chưa có dữ liệu bán hàng</td></tr>`;
            return;
        }

        // Find max sold for progress bar
        const maxSold = Math.max(...products.map(p => p.totalSold));

        tbody.innerHTML = products.map((p, i) => `
            <tr class="hover:bg-neutral-50/50 transition-colors">
                <td class="px-5 py-3.5">
                    <span class="inline-flex items-center justify-center w-5 h-5 text-[9px] font-black ${i < 3 ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500'}">${i + 1}</span>
                </td>
                <td class="px-5 py-3.5">
                    <div class="text-[12px] font-bold text-neutral-700 truncate max-w-[200px]">${p.productName || 'Sản phẩm'}</div>
                    <div class="mt-1.5 h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div class="h-full bg-primary rounded-full transition-all duration-1000" style="width: ${(p.totalSold / maxSold * 100).toFixed(0)}%"></div>
                    </div>
                </td>
                <td class="px-5 py-3.5 text-[12px] font-bold text-center">${new Intl.NumberFormat('vi-VN').format(p.totalSold)}</td>
                <td class="px-5 py-3.5 text-[12px] font-bold text-primary text-right">${formatVND(p.revenue)}</td>
            </tr>
        `).join('');
    }

    // === RENDER ORDER STATUS CHART ===
    function renderStatusChart(stats) {
        const container = document.getElementById('status-chart');
        if (!container || !stats) return;

        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        if (total === 0) {
            container.innerHTML = `<p class="text-[11px] text-neutral-400 text-center py-4">Chưa có dữ liệu</p>`;
            return;
        }

        const STATUS_COLORS = {
            'PENDING_CONFIRMATION': '#f59e0b',
            'PENDING_PAYMENT': '#f59e0b',
            'PAID': '#3b82f6',
            'PROCESSING': '#6366f1',
            'SHIPPING': '#8b5cf6',
            'DELIVERED': '#10b981',
            'COMPLETED': '#059669',
            'CANCELLED': '#ef4444',
            'PAYMENT_FAILED': '#dc2626',
            'PAYMENT_EXPIRED': '#a3a3a3',
        };

        // Stacked bar
        const barHtml = `
            <div class="flex h-3 rounded-full overflow-hidden bg-neutral-100 mb-5">
                ${Object.entries(stats).map(([status, count]) => {
                    const pct = (count / total * 100).toFixed(1);
                    const color = STATUS_COLORS[status] || '#d4d4d4';
                    return `<div style="width:${pct}%;background:${color}" title="${(STATUS_MAP[status]?.label || status)}: ${count} đơn (${pct}%)"></div>`;
                }).join('')}
            </div>`;

        // Legend
        const legendHtml = `
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                ${Object.entries(stats).map(([status, count]) => {
                    const color = STATUS_COLORS[status] || '#d4d4d4';
                    const label = STATUS_MAP[status]?.label || status;
                    const pct = (count / total * 100).toFixed(1);
                    return `
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full flex-shrink-0" style="background:${color}"></span>
                            <span class="text-[10px] text-neutral-500 truncate">${label}</span>
                            <span class="text-[10px] font-bold text-neutral-700 ml-auto">${count} <span class="text-neutral-400 font-normal">(${pct}%)</span></span>
                        </div>`;
                }).join('')}
            </div>`;

        container.innerHTML = barHtml + legendHtml;
    }

    // === MAIN: FETCH & RENDER ===
    async function loadDashboard() {
        // Show loading skeleton
        document.querySelectorAll('.kpi-value').forEach(el => {
            el.textContent = '...';
        });

        try {
            const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/admin/login';
                return;
            }
            if (!res.ok) throw new Error('API Error: ' + res.status);

            const data = await res.json();

            renderKPIs(data);
            renderRecentOrders(data.recentOrders);
            renderTopProducts(data.topProducts);
            renderStatusChart(data.orderStatusStats);

        } catch (err) {
            console.error('Dashboard load error:', err);
            document.querySelectorAll('.kpi-value').forEach(el => {
                el.textContent = 'Lỗi';
            });
        }
    }

    // === INIT ===
    document.addEventListener('DOMContentLoaded', () => {
        // Set current date
        const dateEl = document.getElementById('currentDate');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('vi-VN', {
                weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
            });
        }

        loadDashboard();
    });
})();
