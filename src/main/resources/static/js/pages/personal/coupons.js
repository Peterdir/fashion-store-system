/**
 * Coupons Module for Personal Center
 * Handles fetching, filtering, and collecting coupons.
 */

const CouponModule = {
    coupons: [],
    isInitialized: false,
    
    /**
     * Initialize the coupon tab
     */
    init() {
        console.log('Coupon Module initializing...');
        
        // Only setup listeners once
        if (!this.isInitialized) {
            this.currentStatus = 'unused';
            this.currentFilter = 'all';
            this.setupEventListeners();
            this.isInitialized = true;
        }
        
        // Always load/refresh data when entering the tab
        this.loadCoupons();
    },

    /**
     * Setup event listeners for sub-tabs and filters
     */
    setupEventListeners() {
        // Sub-tabs (Unused, Used, Expired)
        const subtabs = document.querySelectorAll('.coupon-subtab');
        subtabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const status = tab.getAttribute('data-status');
                if (!status) return;
                
                this.currentStatus = status;
                
                // Update UI active state
                subtabs.forEach(t => {
                    t.classList.remove('text-primary', 'font-black', 'border-b-2', 'border-primary');
                    t.classList.add('text-on-surface-variant/60', 'font-bold');
                });
                tab.classList.remove('text-on-surface-variant/60', 'font-bold');
                tab.classList.add('text-primary', 'font-black', 'border-b-2', 'border-primary');
                
                this.renderCoupons();
            });
        });

        // Filter Pills (All, Expiring, New, etc.)
        const filterPills = document.querySelectorAll('.coupon-filter-pill');
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                const filter = pill.getAttribute('data-filter');
                if (!filter) return;

                this.currentFilter = filter;

                // Update UI active state
                filterPills.forEach(p => {
                    p.classList.remove('bg-primary', 'text-white', 'font-black', 'border-primary');
                    p.classList.add('bg-surface-low', 'text-on-surface-variant', 'font-bold', 'border-outline/10');
                });
                pill.classList.remove('bg-surface-low', 'text-on-surface-variant', 'font-bold', 'border-outline/10');
                pill.classList.add('bg-primary', 'text-white', 'font-black', 'border-primary');

                this.renderCoupons();
            });
        });

        // Containers
        this.exclusiveContainer = document.getElementById('exclusive-offers-list');
        this.myCouponsContainer = document.getElementById('my-coupons-list');
    },

    /**
     * Fetch coupons from API
     */
    async loadCoupons() {
        if (typeof AuthUtils === 'undefined' || !AuthUtils.isAuthenticated()) return;
        const user = AuthUtils.getUser();
        
        try {
            const response = await fetch(`/api/coupons`);
            if (response.ok) {
                this.coupons = await response.json();
                this.renderExclusiveOffers();
                this.renderCoupons(); // Re-render with default settings
            }
        } catch (error) {
            console.error('Error loading coupons:', error);
        }
    },

    /**
     * Render "Exclusive Offers" (Coupons not yet collected)
     */
    renderExclusiveOffers() {
        const available = this.coupons.filter(c => !c.collected && !this.isExpired(c.expiryDate));
        const container = document.getElementById('exclusive-offers-list');
        if (!container) return;

        if (available.length === 0) {
            container.innerHTML = '<p class="text-[10px] font-medium opacity-40 uppercase py-4">Không có ưu đãi mới nào cho bạn</p>';
            return;
        }

        let html = '';
        available.forEach(coupon => {
            const discountLabel = coupon.discountType === 'PERCENTAGE' ? coupon.discountValue.toFixed(0) + '%' : this.formatVND(coupon.discountValue);
            const minOrderLabel = this.formatVND(coupon.minOrderAmount);
            const expiryStr = this.formatDate(coupon.expiryDate);

            html += `
                <div class="bg-[#FFF8F6] border border-[#FFE4DE] rounded-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                    <div class="flex h-32">
                        <div class="w-1/3 bg-white flex flex-col items-center justify-center p-6 border-r border-dashed border-[#FFE4DE] relative">
                            <div class="absolute -top-3 -right-3 w-6 h-6 bg-white border border-[#FFE4DE] rounded-full"></div>
                            <div class="absolute -bottom-3 -right-3 w-6 h-6 bg-white border border-[#FFE4DE] rounded-full"></div>
                            
                            <div class="text-secondary flex items-baseline gap-1">
                                <span class="text-3xl font-black tracking-tighter">${coupon.discountType === 'PERCENTAGE' ? coupon.discountValue : this.formatShortVND(coupon.discountValue)}</span>
                                <span class="text-[10px] font-black uppercase">${coupon.discountType === 'PERCENTAGE' ? '%' : 'VNĐ'}</span>
                            </div>
                            <p class="text-[8px] font-medium text-on-surface-variant/60 mt-2 uppercase tracking-tight">Đơn từ ${minOrderLabel}</p>
                        </div>
                        <div class="flex-1 bg-white p-6 relative">
                            <div>
                                <h4 class="text-sm font-black tracking-tight text-primary uppercase mb-1">Mã: ${coupon.code}</h4>
                                <p class="text-[10px] font-medium text-on-surface-variant/60">Hết hạn: ${expiryStr}</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-[#FFFCFB] border-t border-[#FFE4DE] px-6 py-4 flex items-center justify-between">
                        <p class="text-[10px] font-medium text-on-surface-variant/80 italic">Giảm ngay ${discountLabel} cho đơn hàng từ ${minOrderLabel}</p>
                        <button onclick="CouponModule.collectCoupon(${coupon.couponId})" class="bg-black text-white px-8 py-2 text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all">Lưu mã</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    /**
     * Render My Coupons (Collected) based on active status and filters
     */
    renderCoupons() {
        const container = document.getElementById('my-coupons-list');
        if (!container) return;

        let filtered = this.coupons.filter(c => c.collected);
        const now = new Date();

        // 1. Filter by Status Tab
        if (this.currentStatus === 'unused') {
            filtered = filtered.filter(c => !c.used && !this.isExpired(c.expiryDate));
        } else if (this.currentStatus === 'used') {
            filtered = filtered.filter(c => c.used);
        } else if (this.currentStatus === 'expired') {
            filtered = filtered.filter(c => !c.used && this.isExpired(c.expiryDate));
        }

        // 2. Filter by Pill selection
        if (this.currentFilter === 'expiring') {
            const threshold = 48 * 60 * 60 * 1000; // 48 hours
            filtered = filtered.filter(c => {
                const expiry = new Date(c.expiryDate);
                const diff = expiry - now;
                return diff > 0 && diff < threshold;
            });
        } else if (this.currentFilter === 'new') {
            const threshold = 72 * 60 * 60 * 1000; // 72 hours
            filtered = filtered.filter(c => {
                const start = new Date(c.startDate);
                return (now - start) < threshold;
            });
        }

        if (filtered.length === 0) {
            container.innerHTML = '<div class="col-span-full py-20 text-center opacity-40"><p class="text-[11px] font-medium uppercase tracking-widest">Không tìm thấy mã nào khớp với bộ lọc</p></div>';
            return;
        }

        let html = '';
        filtered.forEach(coupon => {
            const isInactive = this.currentStatus !== 'unused';
            const valueDisplay = coupon.discountType === 'PERCENTAGE' ? coupon.discountValue : this.formatShortVND(coupon.discountValue);
            const unit = coupon.discountType === 'PERCENTAGE' ? '%' : 'K';
            
            html += `
                <div class="bg-[#FFF8F6] border border-[#FFE4DE] rounded-sm overflow-hidden flex group hover:shadow-md transition-shadow relative ${isInactive ? 'opacity-60 grayscale' : ''}">
                    <div class="w-2/5 bg-white flex flex-col items-center justify-center p-6 border-r border-dashed border-[#FFE4DE] relative">
                        <div class="absolute -top-3 -right-3 w-6 h-6 bg-white border border-[#FFE4DE] rounded-full"></div>
                        <div class="absolute -bottom-3 -right-3 w-6 h-6 bg-white border border-[#FFE4DE] rounded-full"></div>
                        
                        <div class="text-secondary flex items-baseline gap-1">
                            <span class="text-3xl font-black tracking-tighter">${valueDisplay}</span>
                            <span class="text-[10px] font-black uppercase">${unit} OFF</span>
                        </div>
                        <p class="text-[8px] font-medium text-on-surface-variant/60 mt-2 uppercase tracking-tight">Đơn từ ${this.formatVND(coupon.minOrderAmount)}</p>
                    </div>
                    <div class="flex-1 bg-white p-4 flex flex-col justify-between">
                        <div>
                            <h4 class="text-[11px] font-black tracking-tight text-primary uppercase mb-1">Mã: ${coupon.code}</h4>
                            <p class="text-[9px] font-black uppercase text-on-surface-variant/60">Hết hạn: <span class="text-secondary">${this.formatDate(coupon.expiryDate)}</span></p>
                        </div>
                        <div class="flex items-center justify-end mt-4">
                            ${!isInactive ? `<button onclick="window.location.href='/category'" class="bg-black text-white px-5 py-1.5 text-[9px] font-black uppercase tracking-widest hover:opacity-80 transition-all shadow-sm">Dùng ngay</button>` : ''}
                            ${this.currentStatus === 'used' ? '<span class="text-[9px] font-black uppercase text-emerald-600">Đã sử dụng</span>' : ''}
                            ${this.currentStatus === 'expired' ? '<span class="text-[9px] font-black uppercase text-red-500">Đã hết hạn</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    /**
     * Collect a coupon
     */
    async collectCoupon(couponId) {
        if (typeof AuthUtils === 'undefined' || !AuthUtils.isAuthenticated()) return;
        const user = AuthUtils.getUser();

        try {
            const response = await fetch(`/api/coupons/collect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponId: couponId })
            });

            if (response.ok) {
                if (window.Toast) Toast.success('Đã lưu mã giảm giá vào ví!');
                this.loadCoupons(); // Refresh data
            } else {
                const error = await response.json();
                if (window.Toast) Toast.error(error.message || 'Không thể lưu mã!');
            }
        } catch (error) {
            console.error('Error collecting coupon:', error);
        }
    },

    // Helpers
    isExpired(dateStr) {
        return new Date(dateStr) < new Date();
    },

    formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    },

    formatVND(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    },

    formatShortVND(amount) {
        if (amount >= 1000) return (amount / 1000).toFixed(0);
        return amount;
    }
};

// Auto-init if PersonalCenter is already active or via coordinator
window.CouponModule = CouponModule;
