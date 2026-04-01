/**
 * My Orders Module
 * Handles loading, filtering, and rendering of user orders.
 */

const OrderModule = {
    currentStatus: 'all',
    currentPage: 0,
    selectedReturnImages: [], // Base64 strings

    /**
     * Initialize Module
     */
    init() {
        console.log('--- OrderModule Initializing ---');
        this.setupListeners();
        this.setupReturnFormListener();
        this.setupSearchAndScrollListeners();
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
        'reviewed': 'DELIVERED,COMPLETED',
        'return': 'CANCELLED,PAYMENT_FAILED,PAYMENT_EXPIRED'
    },

    terminalStatuses: ['COMPLETED', 'CANCELLED', 'PAYMENT_FAILED', 'PAYMENT_EXPIRED'],

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

        // Review History tab listener
        const reviewHistoryLink = document.querySelector('.tab-link[data-tab="review-history"]');
        if (reviewHistoryLink) {
            reviewHistoryLink.addEventListener('click', () => {
                this.loadReviewHistory();
            });
        }

        this.setupStarListeners();
    },

    /**
     * Search and Scroll Listeners
     */
    setupSearchAndScrollListeners() {
        const searchBtn = document.getElementById('order-search-btn');
        const searchInput = document.getElementById('order-search-input');
        const scrollLeft = document.getElementById('order-tab-scroll-left');
        const scrollRight = document.getElementById('order-tab-scroll-right');
        const container = document.getElementById('order-subtabs-container');

        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => this.toggleSearch());
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        if (scrollLeft && scrollRight && container) {
            scrollLeft.addEventListener('click', () => this.scrollTabs('left'));
            scrollRight.addEventListener('click', () => this.scrollTabs('right'));

            // Show/hide arrows based on scroll position
            container.addEventListener('scroll', () => {
                scrollLeft.classList.toggle('hidden', container.scrollLeft <= 5);
                scrollRight.classList.toggle('hidden', 
                    container.scrollLeft + container.clientWidth >= container.scrollWidth - 5);
            });

            // Initial check
            setTimeout(() => {
                scrollRight.classList.toggle('hidden', 
                    container.scrollLeft + container.clientWidth >= container.scrollWidth - 5);
            }, 500);
        }
    },

    toggleSearch() {
        const input = document.getElementById('order-search-input');
        const isHidden = input.classList.contains('w-0');
        
        if (isHidden) {
            input.classList.remove('w-0', 'opacity-0', 'px-0');
            input.classList.add('w-48', 'md:w-72', 'opacity-100', 'px-3');
            input.focus();
        } else {
            input.classList.add('w-0', 'opacity-0', 'px-0');
            input.classList.remove('w-48', 'md:w-72', 'opacity-100', 'px-3');
            if (input.value) {
                input.value = '';
                this.handleSearch('');
            }
        }
    },

    handleSearch(keyword) {
        if (!this.allCurrentOrdersData) return;
        
        const term = keyword.toLowerCase().trim();
        if (!term) {
            this.renderOrders(this.allCurrentOrdersData, this.isItemCard);
            return;
        }

        const filtered = this.allCurrentOrdersData.content.filter(item => {
            // Check order ID
            const orderIdMatch = (item.id || item.orderId || '').toString().toLowerCase().includes(term);
            // Check code
            const codeMatch = (item.code || '').toLowerCase().includes(term);
            // Check product name (if item card)
            const productNameMatch = (item.productName || '').toLowerCase().includes(term);
            // Check all items in order (if order card)
            let itemsMatch = false;
            if (item.items) {
                itemsMatch = item.items.some(i => (i.productName || '').toLowerCase().includes(term));
            }

            return orderIdMatch || codeMatch || productNameMatch || itemsMatch;
        });

        // Create a fake page data for rendering
        const filteredData = {
            ...this.allCurrentOrdersData,
            content: filtered,
            totalElements: filtered.length,
            numberOfElements: filtered.length,
            // Keep original pagination but it might be confusing, usually search resets view
        };

        this.renderOrders(filteredData, this.isItemCard);
    },

    scrollTabs(direction) {
        const container = document.getElementById('order-subtabs-container');
        if (!container) return;
        
        // Use a slightly larger scroll amount for better UX
        const scrollAmount = 300;
        const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
        
        container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    },

    setupStarListeners() {
        const stars = document.querySelectorAll('.star-btn');
        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                this.highlightStars(rating);
            });
            star.addEventListener('mouseleave', () => {
                const currentRating = parseInt(document.getElementById('review-rating-value').value);
                this.highlightStars(currentRating);
            });
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                this.selectRating(rating);
            });
        });
    },

    /**
     * Fetch orders from API
     */
    async loadOrders(status = 'all', page = 0) {
        this.currentPage = page;
        const contentArea = document.getElementById('order-tab-content-area');
        const loadingArea = document.getElementById('order-loading');

        if (loadingArea) loadingArea.classList.remove('hidden');
        if (contentArea) {
            contentArea.classList.add('hidden');
            // Khôi phục padding mặc định nếu không phải tab review
            if (status !== 'reviewed') {
                contentArea.classList.remove('p-6');
                contentArea.classList.add('p-20');
                contentArea.classList.replace('justify-start', 'justify-center');
            }
        }

        try {
            const backendStatus = this.statusMapping[status] || null;
            let url = `/api/orders?page=${page}&size=10`;
            let isItemCard = false;

            if (status === 'reviewed') {
                this.currentStatus = 'reviewed';
                await this.loadReviewHistory(page, true);
                return;
            }

            if (status !== 'all' && status !== 'unpaid') {
                url = `/api/orders/items?page=${page}&size=10`;
                isItemCard = true;
                
                // Thêm tham số reviewed dựa trên tab
                if (status === 'review') {
                    url += `&reviewed=false`;
                }
            }

            if (backendStatus) {
                url += `&statuses=${backendStatus}`;
            }

            const response = await fetch(`${url}&_t=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Failed to fetch orders');

            const data = await response.json();
            
            // Store for client-side searching
            this.allCurrentOrdersData = data;
            this.isItemCard = isItemCard;

            // Render the data with the correct card format
            this.renderOrders(data, isItemCard);

            // Hide loading
            if (loadingArea) loadingArea.classList.add('hidden');
            if (contentArea) contentArea.classList.remove('hidden');

            // Scroll to top of tab content if it's a page change
            const tabHeader = document.querySelector('.personal-tabs-header');
            if (tabHeader && page > 0) tabHeader.scrollIntoView({ behavior: 'smooth' });

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
     * Render the list of orders with pagination
     */
    renderOrders(pageData, isItemCard = false) {
        const container = document.getElementById('order-tab-content-area');
        if (!container) return;

        const orders = pageData.content || [];

        if (orders.length === 0 && pageData.number === 0) {
            // ... (keep existing empty state logic)
            let emptyIcon = 'package_2';
            let emptyTitle = 'Trống Trơn!';
            let emptyDesc = 'Bạn chưa có bất kỳ đơn hàng nào trong hệ thống.';

            switch (this.currentStatus) {
                case 'unpaid': emptyIcon = 'account_balance_wallet'; emptyTitle = 'Tuyệt vời!'; emptyDesc = 'Bạn không có đơn hàng nào chờ thanh toán.'; break;
                case 'processing': emptyIcon = 'inventory_2'; emptyTitle = 'Sẵn sàng!'; emptyDesc = 'Không có đơn hàng nào đang xử lý.'; break;
                case 'shipped': emptyIcon = 'local_shipping'; emptyTitle = 'Đường thông!'; emptyDesc = 'Không có đơn hàng nào đang vận chuyển.'; break;
                case 'review': emptyIcon = 'rate_review'; emptyTitle = 'Tuyệt vời!'; emptyDesc = 'Đã hết sản phẩm chờ đánh giá! Cảm ơn bạn.'; break;
                case 'reviewed': emptyIcon = 'history_edu'; emptyTitle = 'Chưa có review!'; emptyDesc = 'Các sản phẩm bạn đã đánh giá sẽ được lưu trữ tại đây.'; break;
                case 'return': emptyIcon = 'assignment_return'; emptyTitle = 'Đáng mừng!'; emptyDesc = 'Bạn không có đơn hàng nào bị hủy/lỗi.'; break;
            }

            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 opacity-40">
                    <span class="material-symbols-outlined text-teal-600 text-6xl mb-4">${emptyIcon}</span>
                    <h3 class="text-sm font-black uppercase tracking-[0.1em] text-black mb-1">${emptyTitle}</h3>
                    <p class="text-[10px] font-bold tracking-widest text-center text-gray-500 max-w-sm">${emptyDesc}</p>
                </div>
            `;
            return;
        }

        container.classList.remove('items-center', 'justify-center', 'min-h-[400px]');
        container.classList.add('block', 'p-0', 'border-none', 'shadow-none', 'bg-transparent', 'space-y-4');

        const cardsHtml = orders.map(order => isItemCard ? this.renderOrderItemCard(order) : this.renderOrderCard(order)).join('');
        const paginationHtml = this.renderPagination(pageData);
        
        container.innerHTML = `
            <div class="space-y-4">${cardsHtml}</div>
            <div class="mt-10 mb-6">${paginationHtml}</div>
        `;
    },

    /**
     * Create Pagination UI
     */
    renderPagination(data) {
        if (data.totalPages <= 1) return '';

        const current = data.number;
        const total = data.totalPages;
        let pages = [];

        // Simple pagination logic
        for (let i = 0; i < total; i++) {
            if (i === 0 || i === total - 1 || (i >= current - 1 && i <= current + 1)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }

        const buttons = pages.map(p => {
            if (p === '...') return `<span class="px-3 py-2 text-gray-400 text-[10px] font-black">...</span>`;
            const active = p === current ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-50';
            return `
                <button onclick="OrderModule.loadOrders('${this.currentStatus}', ${p})" 
                        class="${active} border border-black px-4 py-2 text-[10px] font-black transition-all">
                    ${p + 1}
                </button>
            `;
        }).join('');

        return `
            <div class="flex items-center justify-center gap-2">
                <button ${current === 0 ? 'disabled' : ''} onclick="OrderModule.loadOrders('${this.currentStatus}', ${current - 1})" 
                        class="border border-black px-3 py-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 transition-all">
                    <span class="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                ${buttons}
                <button ${current === total - 1 ? 'disabled' : ''} onclick="OrderModule.loadOrders('${this.currentStatus}', ${current + 1})" 
                        class="border border-black px-3 py-2 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 transition-all">
                    <span class="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>
        `;
    },

    /**
     * Create HTML for individual Single Product Item card
     */
    renderOrderItemCard(item) {
        const date = new Date(item.orderDate).toLocaleDateString('vi-VN');
        const statusEnum = item.status || 'PENDING_PAYMENT';
        let statusString = 'Đã đặt';
        let statusColor = 'text-gray-500 bg-gray-50 border-gray-200';

        switch (statusEnum) {
            case 'PENDING_PAYMENT':
                statusString = 'Chờ thanh toán';
                statusColor = 'text-yellow-700 bg-yellow-50 border-yellow-200'; break;
            case 'PENDING_CONFIRMATION':
                statusString = 'Chờ xác nhận';
                statusColor = 'text-yellow-700 bg-yellow-50 border-yellow-200'; break;
            case 'PAID':
            case 'PROCESSING':
                statusString = 'Đang chuẩn bị';
                statusColor = 'text-blue-700 bg-blue-50 border-blue-200'; break;
            case 'SHIPPING':
                statusString = 'Đang giao';
                statusColor = 'text-indigo-700 bg-indigo-50 border-indigo-200'; break;
            case 'DELIVERED':
                statusString = 'Đã giao';
                statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200'; break;
            case 'COMPLETED':
                statusString = 'Hoàn tất';
                statusColor = 'text-green-700 bg-green-50 border-green-200'; break;
            case 'CANCELLED':
            case 'PAYMENT_FAILED':
            case 'PAYMENT_EXPIRED':
                statusString = 'Đã hủy / Lỗi';
                statusColor = 'text-red-700 bg-red-50 border-red-200'; break;
        }

        const fallbackImg = 'https://vietcetera.com/uploads/images/15-apr-2021/screen-shot-2021-04-15-at-13-21-47-1618467727402.png';
        const imgUrl = item.productImage || fallbackImg;
        const strProductId = item.productId ? 'PROD-' + String(item.productId).padStart(6, '0') : 'N/A';
        const strOrderIdFull = item.orderId ? 'ORD-' + String(item.orderId).padStart(6, '0') : 'N/A';
        const finalOrderTotal = new Intl.NumberFormat('vi-VN').format(item.orderTotalAmount);

        // Refund Status Badge
        let refundBadge = '';
        if (item.refundStatus && item.refundStatus !== 'NONE') {
            const statusMap = {
                'PENDING': { text: 'Đang chờ trả hàng', class: 'bg-amber-50 text-amber-600 border-amber-100' },
                'COMPLETED': { text: 'Đã hoàn trả', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                'FAILED': { text: 'Trả hàng thất bại', class: 'bg-rose-50 text-rose-600 border-rose-100' }
            };
            const config = statusMap[item.refundStatus] || { text: item.refundStatus, class: 'bg-gray-50 text-gray-600 border-gray-100' };
            refundBadge = `
                <div class="inline-flex items-center px-2 py-0.5 rounded-full border ${config.class} text-[7px] font-black uppercase tracking-wider">
                    <span class="w-1 h-1 rounded-full bg-current mr-1 animate-pulse"></span>
                    ${config.text}
                </div>
            `;
        }

        // Return button logic
        let returnBtn = '';
        if ((statusEnum === 'DELIVERED' || statusEnum === 'COMPLETED') && (!item.refundStatus || item.refundStatus === 'NONE')) {
            returnBtn = `
                <button onclick="OrderModule.openReturnModal(${item.orderId}, ${item.orderItemId}, '${item.productName.replace(/'/g, "\\'")}', '${imgUrl}', '${item.color || 'Màu tiêu chuẩn'}', '${item.size || 'F'}')" 
                        class="text-center border border-red-200 text-red-500 px-3 py-1.5 text-[8px] font-black tracking-widest uppercase hover:bg-red-50 transition-colors">
                    Trả hàng
                </button>
            `;
        }
        
        // Cancellation Button Logic (MỚI)
        const cancellableStates = ['PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'PAID', 'PROCESSING'];
        let cancelBtn = '';
        if (cancellableStates.includes(statusEnum)) {
            cancelBtn = `
                <button onclick="OrderModule.openCancelModal(${item.orderId}, '${strOrderIdFull}')" 
                        class="flex-1 text-center py-2.5 text-[9px] font-black tracking-widest uppercase text-red-500 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-[13px]">cancel</span> Hủy đơn
                </button>
            `;
        }
        // Nút Thanh toán lại (MỚI)
        let payBtn = '';
        if (statusEnum === 'PENDING_PAYMENT') {
            payBtn = `
                <a href="/checkout/payment-summary?orderId=${item.orderId}" 
                   class="flex-1 text-center py-2.5 text-[9px] font-black tracking-widest uppercase bg-black text-white hover:bg-primary transition-all flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-[13px]">payments</span> Thanh toán ngay
                </a>
            `;
        }

        return `
            <div class="border border-black flex flex-col group hover:shadow-[3px_3px_0_0_#000] transition-all duration-300 relative overflow-hidden bg-white">
                
                <!-- Card Header (Slightly Larger) -->
                <div class="border-b border-black p-3.5 flex justify-between items-center bg-gray-50/40">
                    <div class="flex items-center gap-3">
                        <div class="bg-black text-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest truncate">
                            ${strOrderIdFull}
                        </div>
                        <span class="text-[10px] font-bold text-gray-400 font-mono flex items-center gap-1">
                            <span class="material-symbols-outlined text-[13px]">calendar_today</span> ${date}
                        </span>
                    </div>
                    <div class="flex items-center gap-2">
                        ${refundBadge}
                        <span class="px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase border ${statusColor}">${statusString}</span>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="flex items-center p-5 gap-5">
                    <a href="/product-detail/${item.productId}" class="w-16 h-20 shrink-0 shadow-sm border border-black/5 hover:border-black transition-all overflow-hidden group/img">
                        <img src="${imgUrl}" class="w-full h-full object-cover transition-all duration-500 group-hover/img:scale-110" onerror="this.src='${fallbackImg}'">
                    </a>
                    
                    <div class="flex-1 min-w-0">
                        <a href="/product-detail/${item.productId}" class="flex items-center gap-2 mb-1 group/name">
                            <h4 class="text-xs font-black text-black uppercase tracking-tight truncate group-hover/name:text-accent transition-colors">${item.productName}</h4>
                            <span class="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">[${strProductId}]</span>
                        </a>
                        <div class="flex gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-gray-400">
                            <span>${item.color || 'FREE'}</span>
                            <span class="text-black/10">•</span>
                            <span>${item.size || 'FREE'}</span>
                            <span class="text-black/10">•</span>
                            <span class="text-black">x${item.quantity}</span>
                        </div>
                    </div>

                    <div class="text-right shrink-0">
                        <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Thành tiền</p>
                        <p class="text-base font-black text-black tracking-tighter">${finalOrderTotal}đ</p>
                    </div>
                </div>

                <!-- Footer -->
                <div class="border-t border-black/5 flex divide-x divide-black/5">
                    <a href="/personal/order/${item.orderId}?fromStatus=${this.currentStatus}" class="flex-1 text-center py-2.5 text-[9px] font-black tracking-widest uppercase hover:bg-neutral-50 transition-colors">Chi tiết</a>
                    ${payBtn}
                    ${cancelBtn}
                    ${this.renderItemActions(item, statusEnum)}
                    ${!returnBtn && !cancelBtn && !payBtn && !this.renderItemActions(item, statusEnum) ? `<a href="/product-detail/${item.productId}" class="flex-1 text-center py-2.5 text-[9px] font-black tracking-widest uppercase text-gray-400 hover:text-black transition-colors">Mua lại</a>` : (returnBtn || '')}
                </div>
            </div>
        `;
    },
    renderItemActions(item, status) {
        const orderId = item.orderId;
        let buttons = '';
        if (status === 'PAYMENT_EXPIRED' || status === 'CANCELLED' || status === 'PAYMENT_FAILED') {
            buttons += `
                <button onclick="OrderModule.repurchaseOrder(${orderId})" class="flex-1 text-center py-2.5 text-[9px] font-black tracking-widest uppercase text-secondary hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-[13px]">refresh</span> Mua lại
                </button>
            `;
        }

        if (status === 'DELIVERED' || status === 'COMPLETED') {
            if (item.isReviewed) {
                buttons += `
                    <div class="flex-1 text-center py-2.5 text-[9px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 border-x border-emerald-100 flex items-center justify-center gap-1">
                        <span class="material-symbols-outlined text-[13px]">verified</span> Đã đánh giá
                    </div>
                `;
            } else {
                buttons += `
                    <button onclick="OrderModule.openReviewModal(${item.productId}, ${item.orderItemId}, '${item.productName.replace(/'/g, "\\'")}', '${item.productImage}', '${item.color}', '${item.size}')" 
                            class="flex-1 text-center py-2.5 text-[9px] font-black tracking-widest uppercase text-amber-600 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1">
                        <span class="material-symbols-outlined text-[13px]">rate_review</span> Đánh giá
                    </button>
                `;
            }
        }

        return buttons;
    },

    /**
     * Setup listener for Return Request Form
     */
    setupReturnFormListener() {
        const form = document.getElementById('return-request-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReturnRequest();
            });
        }
    },

    /**
     * Open Return Request Modal
     */
    openReturnModal(orderId, orderItemId, productName, productImg, color, size) {
        document.getElementById('return-order-id').value = orderId;
        document.getElementById('return-order-item-id').value = orderItemId;
        document.getElementById('return-product-name').textContent = productName;
        document.getElementById('return-product-img').src = productImg;
        document.getElementById('return-product-color').textContent = `Màu: ${color}`;
        document.getElementById('return-product-size').textContent = `Size: ${size}`;

        // Reset form
        document.getElementById('return-reason').value = '';
        document.getElementById('return-description').value = '';
        this.selectedReturnImages = [];
        this.renderReturnImagePreviews();

        const modal = document.getElementById('return-request-modal');
        const backdrop = modal.querySelector('.bg-backdrop-return');
        const content = modal.querySelector('.bg-modal-return');

        modal.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.add('opacity-100');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    },

    /**
     * Close Return Request Modal
     */
    closeReturnModal() {
        const modal = document.getElementById('return-request-modal');
        const backdrop = modal.querySelector('.bg-backdrop-return');
        const content = modal.querySelector('.bg-modal-return');

        backdrop.classList.remove('opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        content.classList.remove('scale-100', 'opacity-100');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    },

    /**
     * Handle Image Selection for Return Request
     */
    async handleReturnImageSelect(event) {
        const files = Array.from(event.target.files);
        const maxImages = 5;
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (this.selectedReturnImages.length + files.length > maxImages) {
            alert(`Bạn chỉ có thể chọn tối đa ${maxImages} hình ảnh.`);
            return;
        }

        for (const file of files) {
            if (file.size > maxSize) {
                alert(`Ảnh "${file.name}" vượt quá kích thước 2MB. Vui lòng chọn ảnh nhẹ hơn.`);
                continue;
            }

            try {
                const base64 = await this.convertToBase64(file);
                this.selectedReturnImages.push(base64);
            } catch (error) {
                console.error('Error converting image:', error);
            }
        }

        this.renderReturnImagePreviews();
        event.target.value = ''; // Reset input
    },

    /**
     * Convert File to Base64
     */
    convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },

    /**
     * Render Image Previews in Modal
     */
    renderReturnImagePreviews() {
        const container = document.getElementById('return-image-previews');
        const counter = document.getElementById('return-image-counter');
        const addBtn = document.getElementById('add-return-image-btn');

        if (!container) return;

        container.innerHTML = this.selectedReturnImages.map((img, index) => `
            <div class="relative w-[70px] h-[70px] group border border-outline/10">
                <img src="${img}" class="w-full h-full object-cover">
                <button type="button" onclick="OrderModule.removeReturnImage(${index})" 
                        class="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg hover:bg-red-500 transition-colors">
                    <span class="material-symbols-outlined text-[12px]">close</span>
                </button>
            </div>
        `).join('');

        if (counter) {
            counter.textContent = `${this.selectedReturnImages.length}/5 Ảnh`;
        }

        // Hide add button if limit reached
        if (addBtn) {
            if (this.selectedReturnImages.length >= 5) {
                addBtn.classList.add('hidden');
            } else {
                addBtn.classList.remove('hidden');
            }
        }
    },

    /**
     * Remove an image from the selection
     */
    removeReturnImage(index) {
        this.selectedReturnImages.splice(index, 1);
        this.renderReturnImagePreviews();
    },

    /**
     * Show Premium Success Modal
     */
    showReturnSuccess() {
        const modal = document.getElementById('return-success-modal');
        const backdrop = modal.querySelector('.bg-backdrop-success');
        const content = modal.querySelector('.bg-modal-success');

        modal.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.add('opacity-100');
            content.classList.remove('scale-90', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    },

    /**
     * Close Premium Success Modal
     */
    closeReturnSuccess() {
        const modal = document.getElementById('return-success-modal');
        const backdrop = modal.querySelector('.bg-backdrop-success');
        const content = modal.querySelector('.bg-modal-success');

        backdrop.classList.remove('opacity-100');
        content.classList.add('scale-90', 'opacity-0');
        content.classList.remove('scale-100', 'opacity-100');

        setTimeout(() => {
            modal.classList.add('hidden');
            this.loadOrders(this.currentStatus);
        }, 500);
    },

    /**
     * Handle Return Request Submission
     */
    async submitReturnRequest() {
        const orderId = document.getElementById('return-order-id').value;
        const orderItemId = document.getElementById('return-order-item-id').value;
        const reason = document.getElementById('return-reason').value;
        const description = document.getElementById('return-description').value;

        if (!reason) {
            alert('Vui lòng chọn lý do trả hàng.');
            return;
        }

        const submitBtn = document.querySelector('#return-request-form button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'ĐANG GỬI...';

        try {
            const response = await fetch('/api/return-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId: parseInt(orderId),
                    itemIds: [parseInt(orderItemId)],
                    reason: reason,
                    description: description,
                    imageUrls: this.selectedReturnImages
                })
            });

            if (response.ok) {
                this.closeReturnModal();
                this.showReturnSuccess();
                // Reload list to update Return buttons
                this.loadOrders(this.currentStatus);
            } else {
                const err = await response.json();
                alert('Lỗi: ' + (err.message || 'Không thể gửi yêu cầu.'));
            }
        } catch (error) {
            console.error('Error submitting return request:', error);
            alert('Đã xảy ra lỗi khi kết nối với máy chủ.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    },

    /**
     * Determine the single dominant status for an order based on item progress.
     * Hides "passed" statuses by picking the one furthest in the workflow.
     */
    getDominantStatus(statusSummary) {
        if (!statusSummary || Object.keys(statusSummary).length === 0) return 'PENDING_CONFIRMATION';

        const statuses = Object.keys(statusSummary);
        if (statuses.length === 1) return statuses[0];

        // Priority list: Higher index = More progressed/Important
        const PRIORITY = [
            'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 
            'PAID', 'PROCESSING', 'SHIPPING', 
            'DELIVERED', 'COMPLETED',
            'PAYMENT_FAILED', 'PAYMENT_EXPIRED', 'CANCELLED'
        ];

        // Sort by priority and pick the highest one that isn't a "failure" unless all are failures
        const sorted = statuses.sort((a, b) => PRIORITY.indexOf(b) - PRIORITY.indexOf(a));
        
        // If there's any active progress (SHIPPING, PROCESSING, etc.), use it over PENDING
        return sorted[0];
    },

    /**
     * Create HTML for individual (Whole) order card (Compact)
     */
    renderOrderCard(order) {
        const date = new Date(order.orderDate).toLocaleDateString('vi-VN');
        const total = new Intl.NumberFormat('vi-VN').format(order.totalAmount);
        const fallbackImg = 'https://vietcetera.com/uploads/images/15-apr-2021/screen-shot-2021-04-15-at-13-21-47-1618467727402.png';

        const strOrderIdFull = 'ORD-' + String(order.orderId).padStart(6, '0');

        // Status display - Now using Dominant Status to avoid "passed" statuses showing up
        const dominantStatus = this.getDominantStatus(order.statusSummary);
        const label = this.getStatusLabel(dominantStatus);

        let colorClass = 'bg-gray-50 text-gray-500 border-gray-200';
        if (dominantStatus === 'DELIVERED' || dominantStatus === 'COMPLETED') colorClass = 'bg-emerald-50 text-emerald-600 border-emerald-100';
        if (dominantStatus === 'SHIPPING') colorClass = 'bg-blue-50 text-blue-600 border-blue-100';
        if (dominantStatus.includes('PENDING')) colorClass = 'bg-amber-50 text-amber-600 border-amber-100';
        if (['CANCELLED', 'PAYMENT_FAILED', 'PAYMENT_EXPIRED'].includes(dominantStatus)) colorClass = 'bg-red-50 text-red-600 border-red-100';

        const statusHtml = `<span class="${colorClass} px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider border rounded-sm">${label}</span>`;

        // Cancellation Button Logic
        const cancellableStates = ['PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'PAID', 'PROCESSING'];
        let cancelBtnHtml = '';
        if (cancellableStates.includes(dominantStatus)) {
            cancelBtnHtml = `
                <button onclick="OrderModule.openCancelModal(${order.orderId}, '${strOrderIdFull}')" 
                        class="text-[9px] font-black text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">cancel</span> Hủy đơn
                </button>
            `;
        }

        // Nút Thanh toán (Cho Order Card)
        let payBtnHtml = '';
        if (dominantStatus === 'PENDING_PAYMENT') {
            payBtnHtml = `
                <a href="/checkout/payment-summary?orderId=${order.orderId}" 
                        class="text-[9px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">payments</span> Thanh toán ngay
                </a>
            `;
        }

        // Mini Gallery (Moderately Sized)
        let galleryHtml = '';
        if (order.items && order.items.length > 0) {
            const displayItems = order.items.slice(0, 3);
            const remaining = order.items.length - 3;
            galleryHtml = `
                <div class="flex -space-x-2 items-center">
                    ${displayItems.map(item => `
                        <div class="relative w-10 h-12 border border-white rounded-sm overflow-hidden flex-shrink-0 shadow-md z-0">
                            <img src="${item.productImage || fallbackImg}" class="w-full h-full object-cover" onerror="this.src='${fallbackImg}'">
                        </div>
                    `).join('')}
                    ${remaining > 0 ? `<div class="relative w-10 h-12 bg-neutral-100 border border-white rounded-sm flex items-center justify-center flex-shrink-0 shadow-md text-[9px] font-black text-neutral-500">+${remaining}</div>` : ''}
                </div>
            `;
        }

        return `
            <div class="bg-white border border-black hover:shadow-[4px_4px_0_0_#000] transition-all duration-300 relative overflow-hidden">
                <div class="flex items-center p-5 gap-6">
                    <!-- Gallery -->
                    <div class="shrink-0">
                        ${galleryHtml}
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-3 mb-1.5">
                            <span class="text-[10px] font-black tracking-widest text-black">${strOrderIdFull}</span>
                            <span class="text-[9px] font-bold text-gray-400 font-mono">${date}</span>
                        </div>
                        <div class="flex items-center gap-4">
                            ${statusHtml}
                            ${payBtnHtml}
                            ${cancelBtnHtml}
                        </div>
                    </div>

                    <!-- Total & Action -->
                    <div class="text-right shrink-0 border-l border-black/5 pl-6">
                        <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 leading-none">TỔNG CỘNG</p>
                        <p class="text-base font-black text-black tracking-tighter mb-2.5">${total}đ</p>
                        <div class="flex flex-col gap-2">
                            <a href="/personal/order/${order.orderId}?fromStatus=${this.currentStatus}" class="inline-block bg-black text-white px-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all text-center">
                                XEM CHI TIẾT
                            </a>
                        </div>
                    </div>
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
            'PROCESSING': 'Đang chuẩn bị',
            'SHIPPING': 'Đang giao',
            'DELIVERED': 'Đã giao',
            'COMPLETED': 'Hoàn tất',
            'CANCELLED': 'Đã hủy',
            'PAYMENT_FAILED': 'Thanh toán lỗi',
            'PAYMENT_EXPIRED': 'Hết hạn'
        };
        return labels[status] || status;
    },

    /**
     * Open Cancel Order Modal
     */
    openCancelModal(orderId, displayId) {
        this.selectedOrderIdForCancel = orderId;
        const displaySpan = document.getElementById('cancel-order-display-id');
        if (displaySpan) displaySpan.textContent = `#${displayId}`;

        // Reset form
        const reasonSelect = document.getElementById('cancel-reason');
        const descriptionText = document.getElementById('cancel-description');
        if (reasonSelect) reasonSelect.value = '';
        if (descriptionText) descriptionText.value = '';

        const modal = document.getElementById('cancel-order-modal');
        const backdrop = modal.querySelector('.bg-backdrop-cancel');
        const content = modal.querySelector('.bg-modal-cancel');

        modal.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.add('opacity-100');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    },

    /**
     * Close Cancel Order Modal
     */
    closeCancelModal() {
        const modal = document.getElementById('cancel-order-modal');
        const backdrop = modal.querySelector('.bg-backdrop-cancel');
        const content = modal.querySelector('.bg-modal-cancel');

        backdrop.classList.remove('opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        content.classList.remove('scale-100', 'opacity-100');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    },

    /**
     * Repurchase an order (opens confirmation modal)
     */
    async repurchaseOrder(orderId) {
        this.openRepurchaseModal(orderId);
    },

    openRepurchaseModal(orderId) {
        this.selectedOrderIdForRepurchase = orderId;
        const modal = document.getElementById('repurchase-order-modal');
        const backdrop = modal.querySelector('.bg-backdrop-repurchase');
        const content = modal.querySelector('.bg-modal-repurchase');

        modal.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.add('opacity-100');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    },

    closeRepurchaseModal() {
        const modal = document.getElementById('repurchase-order-modal');
        const backdrop = modal.querySelector('.bg-backdrop-repurchase');
        const content = modal.querySelector('.bg-modal-repurchase');

        backdrop.classList.remove('opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        content.classList.remove('scale-100', 'opacity-100');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    },

    async submitRepurchaseOrder() {
        const orderId = this.selectedOrderIdForRepurchase;
        if (!orderId) return;

        try {
            const response = await fetch(`/api/orders/${orderId}/repurchase`, {
                method: 'POST'
            });

            this.closeRepurchaseModal();

            if (response.ok) {
                alert('Đã thêm các sản phẩm vào giỏ hàng thành công!');
                window.location.href = '/cart';
            } else {
                const err = await response.json();
                alert('Lỗi: ' + (err.message || 'Không thể mua lại đơn hàng.'));
            }
        } catch (error) {
            console.error('Repurchase error:', error);
            this.closeRepurchaseModal();
            alert('Đã xảy ra lỗi khi kết nối với máy chủ.');
        }
    },

    /**
     * Product Review Modal Management
     */
    openReviewModal(productId, orderItemId, productName, productImg, color, size) {
        // Set info
        document.getElementById('review-product-id').value = productId;
        document.getElementById('review-product-img').src = productImg;
        document.getElementById('review-product-name').textContent = productName;
        document.getElementById('review-product-info').textContent = `Màu: ${color} • Size: ${size}`;
        document.getElementById('review-order-item-id').value = orderItemId || '';
        
        // Reset modal
        this.selectRating(0);
        document.getElementById('review-comment').value = '';
        
        // Hide error message if any
        const errorMsg = document.getElementById('review-rating-error');
        if (errorMsg) errorMsg.classList.add('hidden');

        const modal = document.getElementById('review-modal');
        const backdrop = modal.querySelector('.bg-backdrop-review');
        const content = modal.querySelector('.bg-modal-review');

        modal.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.add('opacity-100');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    },

    closeReviewModal() {
        const modal = document.getElementById('review-modal');
        const backdrop = modal.querySelector('.bg-backdrop-review');
        const content = modal.querySelector('.bg-modal-review');

        backdrop.classList.remove('opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        content.classList.remove('scale-100', 'opacity-100');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    },

    highlightStars(rating) {
        const stars = document.querySelectorAll('.star-btn');
        stars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= rating) {
                star.classList.replace('text-gray-200', 'text-amber-400');
                star.style.fontVariationSettings = "'FILL' 1";
            } else {
                star.classList.replace('text-amber-400', 'text-gray-200');
                star.style.fontVariationSettings = "'FILL' 0";
            }
        });
    },

    selectRating(rating) {
        document.getElementById('review-rating-value').value = rating;
        this.highlightStars(rating);
        
        // Hide error message when rating is selected
        const errorMsg = document.getElementById('review-rating-error');
        if (errorMsg && rating > 0) errorMsg.classList.add('hidden');

        const texts = {
            0: '',
            1: 'Tệ',
            2: 'Không hài lòng',
            3: 'Bình thường',
            4: 'Hài lòng',
            5: 'Tuyệt vời'
        };
        document.getElementById('rating-text').textContent = texts[rating];
    },

    async submitReview() {
        const productId = document.getElementById('review-product-id').value;
        const orderItemId = document.getElementById('review-order-item-id').value;
        const rating = parseInt(document.getElementById('review-rating-value').value);
        const comment = document.getElementById('review-comment').value;

        if (rating === 0) {
            const errorMsg = document.getElementById('review-rating-error');
            if (errorMsg) errorMsg.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch('/api/reviews', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, orderItemId, rating, comment })
            });

            if (response.ok) {
                this.closeReviewModal();
                this.showReviewSuccess();
                this.loadOrders(this.currentStatus);
            } else {
                const err = await response.json();
                alert('Lỗi: ' + (err.message || 'Không thể gửi đánh giá.'));
            }
        } catch (error) {
            console.error('Submit review error:', error);
            alert('Lỗi kết nối server.');
        }
    },

    /**
     * Submit Cancel Order API
     */
    async submitCancelOrder() {
        const orderId = this.selectedOrderIdForCancel;
        const reason = document.getElementById('cancel-reason').value;
        const note = document.getElementById('cancel-description').value;

        if (!reason) {
            alert('Vui lòng chọn lý do hủy đơn.');
            return;
        }

        const fullReason = note ? `${reason}: ${note}` : reason;

        try {
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cancellationReason: fullReason })
            });

            if (response.ok) {
                this.closeCancelModal();
                this.showCancelSuccess();
            } else {
                const err = await response.json();
                this.closeCancelModal();
                this.showCancelFailed(err.message || 'Không thể hủy đơn hàng lúc này.');
            }
        } catch (error) {
            console.error('Cancel order error:', error);
            alert('Lỗi kết nối server.');
        }
    },

    /**
     * Show Cancel Success Modal
     */
    showCancelSuccess() {
        const modal = document.getElementById('cancel-success-modal');
        const backdrop = modal.querySelector('.bg-backdrop-cancel-success');
        const content = modal.querySelector('.bg-modal-cancel-success');

        modal.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.add('opacity-100');
            content.classList.remove('scale-90', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    },

    /**
     * Close Cancel Success Modal
     */
    closeCancelSuccess() {
        const modal = document.getElementById('cancel-success-modal');
        const backdrop = modal.querySelector('.bg-backdrop-cancel-success');
        const content = modal.querySelector('.bg-modal-cancel-success');

        backdrop.classList.remove('opacity-100');
        content.classList.add('scale-90', 'opacity-0');
        content.classList.remove('scale-100', 'opacity-100');

        setTimeout(() => {
            modal.classList.add('hidden');
            this.loadOrders(this.currentStatus);
        }, 500);
    },

    /**
     * Show Cancel Failed Modal
     */
    showCancelFailed(message) {
        const modal = document.getElementById('cancel-failed-modal');
        const backdrop = modal.querySelector('.bg-backdrop-cancel-failed');
        const content = modal.querySelector('.bg-modal-cancel-failed');
        const messagePara = document.getElementById('cancel-failed-message');

        if (messagePara) messagePara.textContent = message;

        modal.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.add('opacity-100');
            content.classList.remove('scale-90', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    },

    /**
     * Close Cancel Failed Modal
     */
    closeCancelFailed() {
        const modal = document.getElementById('cancel-failed-modal');
        const backdrop = modal.querySelector('.bg-backdrop-cancel-failed');
        const content = modal.querySelector('.bg-modal-cancel-failed');

        backdrop.classList.remove('opacity-100');
        content.classList.add('scale-90', 'opacity-0');
        content.classList.remove('scale-100', 'opacity-100');

        setTimeout(() => {
            modal.classList.add('hidden');
            this.loadOrders(this.currentStatus); // Reload anyway to refresh status
        }, 500);
    },


    showReviewSuccess() {
        const modal = document.getElementById('review-success-modal');
        if (!modal) return;
        
        const backdrop = modal.querySelector('.bg-backdrop-review-success');
        const content = modal.querySelector('.bg-modal-review-success');

        // Reset state
        modal.classList.remove('hidden');
        if (backdrop) {
            backdrop.classList.remove('opacity-100');
            backdrop.classList.add('opacity-0');
        }
        if (content) {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale(90)', 'opacity-0');
        }

        // Trigger animation
        setTimeout(() => {
            if (backdrop) backdrop.classList.add('opacity-100');
            if (content) {
                content.classList.remove('scale(90)', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }
        }, 50);
    },

    closeReviewSuccess() {
        const modal = document.getElementById('review-success-modal');
        const backdrop = modal.querySelector('.bg-backdrop-review-success');
        const content = modal.querySelector('.bg-modal-review-success');

        backdrop.classList.remove('opacity-100');
        content.classList.add('scale-90', 'opacity-0');
        content.classList.remove('scale-100', 'opacity-100');

        setTimeout(() => {
            modal.classList.add('hidden');
            // If we are currently on the review orders tab, reload it
            if (this.currentStatus === 'review') {
                this.loadOrders('review');
            }
        }, 500);
    },

    /**
     * Review History Logic
     */
    async loadReviewHistory(page = 0, explicitlyOrderTab = false) {
        const orderContentArea = document.getElementById('order-tab-content-area');
        const reviewHistoryContainer = document.getElementById('review-history-container');
        const loadingArea = document.getElementById('order-loading');
        
        // Xác định container dựa trên ngữ cảnh gọi hoặc trạng thái hiện tại
        const isOrderTabContext = explicitlyOrderTab || 
                                 this.currentStatus === 'reviewed' || 
                                 (orderContentArea && !orderContentArea.closest('.hidden'));
        
        const container = isOrderTabContext ? orderContentArea : reviewHistoryContainer;
        
        if (!container) return;

        // Bật loading nếu đang ở trong tab Orders
        if (isOrderTabContext && loadingArea) {
            loadingArea.classList.remove('hidden');
            container.classList.add('hidden');
        }

        try {
            const response = await fetch(`/api/reviews/my?page=${page}&size=5&sort=createdAt,desc`);
            if (response.ok) {
                const data = await response.json();
                this.renderReviewHistory(data.content, container);
                this.renderReviewHistoryPagination(data, isOrderTabContext);
            }
        } catch (error) {
            console.error('Error loading review history:', error);
            container.innerHTML = '<p class="text-center py-10 uppercase text-[10px] font-bold text-red-500">Không thể tải lịch sử đánh giá.</p>';
        } finally {
            // Luôn đảm bảo tắt loading nếu đang ở tab Orders
            if (isOrderTabContext && loadingArea) {
                loadingArea.classList.add('hidden');
                container.classList.remove('hidden');
            }
        }
    },
    
    renderReviewHistory(reviews, targetContainer = null) {
        const container = targetContainer || document.getElementById('review-history-container');
        if (!container) return;

        // Tối ưu hóa padding nếu đang ở trong tab Orders để "trải dài" hơn
        if (container.id === 'order-tab-content-area') {
            container.classList.remove('p-20');
            container.classList.add('p-6', 'w-full');
            container.classList.replace('justify-center', 'justify-start');
        }

        if (!reviews || reviews.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 opacity-30 w-full">
                    <span class="material-symbols-outlined text-6xl mb-4">history_edu</span>
                    <p class="text-[10px] font-black uppercase tracking-widest">Bạn chưa có đánh giá nào.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="w-full space-y-6">
                ${reviews.map(review => {
                    const orderDate = review.orderDate ? new Date(review.orderDate).toLocaleString('vi-VN') : 'N/A';
                    const reviewDate = new Date(review.createdAt).toLocaleDateString('vi-VN');
                    const formattedPrice = review.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(review.price) : 'N/A';
                    
                    return `
                    <div class="bg-neutral-50/50 border border-black/5 p-4 md:p-6 hover:border-black transition-all group w-full relative overflow-hidden">
                        <!-- Status Badge -->
                        <div class="absolute top-0 right-0">
                            <div class="bg-emerald-500 text-white px-4 py-1 text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1 shadow-sm">
                                <span class="material-symbols-outlined text-[10px]">check_circle</span>
                                Đã Đánh Giá
                            </div>
                        </div>

                        <div class="flex flex-col gap-4">
                            <!-- Product & Order Header -->
                            <div class="flex gap-4 items-start pb-3 border-b border-black/5">
                                <a href="/product-detail/${review.productId}" class="w-16 h-20 shrink-0 bg-white border border-black/5 overflow-hidden shadow-sm">
                                    <img src="${review.productImage || '/images/placeholder.jpg'}" class="w-full h-full object-cover">
                                </a>
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start mb-1">
                                        <a href="/product-detail/${review.productId}" class="hover:text-primary transition-colors">
                                            <h4 class="text-[11px] font-black uppercase tracking-widest text-black/80 truncate pr-20">${review.productName}</h4>
                                        </a>
                                    </div>
                                    <div class="flex flex-wrap items-center gap-4 text-[9px] font-bold text-black/40 uppercase tracking-widest">
                                        <div class="flex items-center gap-1">
                                            <span class="material-symbols-outlined text-sm">calendar_today</span>
                                            Ngày đặt: ${orderDate}
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <span class="material-symbols-outlined text-sm">payments</span>
                                            Giá: <span class="text-secondary font-black">${formattedPrice}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- THE REVIEW CONTENT (CENTERPIECE) -->
                            <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <!-- Star Rating -->
                                <div class="flex flex-col gap-1 shrink-0 md:border-r md:border-black/5 md:pr-6">
                                    <span class="text-[8px] font-black uppercase tracking-[0.3em] text-black/30">Điểm Đánh Giá</span>
                                    <div class="flex text-amber-500 gap-0.5">
                                        ${Array(5).fill(0).map((_, i) => `
                                            <span class="material-symbols-outlined text-lg" 
                                                  style="${i < review.rating ? "font-variation-settings: 'FILL' 1" : ""}">
                                                ${i < review.rating ? 'star' : 'star_outline'}
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>

                                <!-- Comment Text Area -->
                                <div class="flex-1 w-full bg-white/60 p-4 border border-black/5 rounded-sm relative group-hover:bg-white transition-colors duration-500">
                                    <span class="material-symbols-outlined absolute -top-3 -left-1 text-black/5 text-4xl">format_quote</span>
                                    <p class="text-[11px] font-bold text-black leading-relaxed italic relative z-10 pl-1">
                                        "${review.comment || 'Không có bình luận.'}"
                                    </p>
                                    <div class="mt-2 flex items-center justify-between">
                                        <span class="text-[8px] font-black uppercase tracking-widest text-black/20 italic">
                                            Ngày đánh giá: ${reviewDate}
                                        </span>
                                        <a href="/product-detail/${review.productId}" class="text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:text-black transition-colors flex items-center gap-1">
                                            Buy Again <span class="material-symbols-outlined text-sm">refresh</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderReviewHistoryPagination(data, isOrderTab = false) {
        let container = document.getElementById('review-history-pagination');
        
        if (isOrderTab) {
            container = document.getElementById('order-tab-pagination');
            if (container) container.classList.remove('hidden');
        }

        if (!container || data.totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = '';
        const currentPage = data.number;
        const totalPages = data.totalPages;

        for (let i = 0; i < totalPages; i++) {
            const onclickHandler = isOrderTab ? `OrderModule.loadOrders('reviewed', ${i})` : `OrderModule.loadReviewHistory(${i})`;
            html += `
                <button onclick="${onclickHandler}" 
                        class="w-8 h-8 flex items-center justify-center text-[10px] font-black border ${i === currentPage ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'} transition-all">
                    ${i + 1}
                </button>
            `;
        }
        container.innerHTML = html;
    }
};

// Expose to window for other scripts to access
window.OrderModule = OrderModule;
