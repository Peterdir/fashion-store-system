/**
 * Admin Returns Management Module
 */
const AdminReturns = {
    currentPage: 0,
    pageSize: 10,
    currentStatus: '',
    currentRequestId: null,

    init() {
        console.log('AdminReturns initialized');
        this.cacheElements();
        this.bindEvents();
        this.fetchReturnRequests();
    },

    cacheElements() {
        this.tableBody = document.getElementById('returns-table-body');
        this.loadingState = document.getElementById('returns-loading');
        this.emptyState = document.getElementById('returns-empty');
        this.pagination = document.getElementById('returns-pagination');
        this.btnResetFilter = document.getElementById('btn-reset-filter');
        this.filterStatus = document.getElementById('filter-status');
        
        // Modal elements
        this.modal = document.getElementById('return-detail-modal');
        this.modalContent = this.modal.querySelector('#modal-content');
        this.modalLoading = this.modal.querySelector('#modal-loading-state');
    },

    bindEvents() {
        if (this.filterStatus) {
            this.filterStatus.addEventListener('change', () => {
                this.currentStatus = this.filterStatus.value;
                this.currentPage = 0;
                this.fetchReturnRequests();
            });
        }

        if (this.btnResetFilter) {
            this.btnResetFilter.addEventListener('click', () => {
                this.filterStatus.value = '';
                this.currentStatus = '';
                this.currentPage = 0;
                this.fetchReturnRequests();
            });
        }
    },

    async fetchReturnRequests() {
        this.showLoading(true);
        try {
            const url = `/api/admin/return-requests?page=${this.currentPage}&size=${this.pageSize}${this.currentStatus ? `&status=${this.currentStatus}` : ''}`;
            const response = await fetch(url);
            
            if (response.status === 401) {
                window.location.href = '/admin/login';
                return;
            }

            const data = await response.json();
            this.renderTable(data.content);
            this.renderPagination(data);
        } catch (error) {
            console.error('Error fetching return requests:', error);
            this.showToast('Không thể tải danh sách yêu cầu', 'error');
        } finally {
            this.showLoading(false);
        }
    },

    renderTable(requests) {
        if (!requests || requests.length === 0) {
            this.tableBody.innerHTML = '';
            this.emptyState.classList.remove('hidden');
            this.pagination.classList.add('hidden');
            return;
        }

        this.emptyState.classList.add('hidden');
        this.pagination.classList.remove('hidden');

        this.tableBody.innerHTML = requests.map(req => {
            const statusConfig = this.getStatusConfig(req.status);
            const date = new Date(req.requestDate).toLocaleDateString('vi-VN', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });

            return `
                <tr class="hover:bg-neutral-50/50 transition-colors group">
                    <td class="px-5 py-4">
                        <span class="text-[11px] font-black text-primary uppercase tracking-tight">#RR-${String(req.requestId).padStart(5, '0')}</span>
                    </td>
                    <td class="px-5 py-4">
                        <div class="flex flex-col">
                            <span class="text-[11px] font-black text-black uppercase">${req.customerName}</span>
                            <span class="text-[10px] text-neutral-400 font-bold">${req.customerEmail}</span>
                        </div>
                    </td>
                    <td class="px-5 py-4">
                        <span class="text-[11px] font-bold text-neutral-600 uppercase tracking-tight">Order #${req.orderId}</span>
                    </td>
                    <td class="px-5 py-4">
                        <span class="text-[10px] font-bold text-neutral-500 uppercase truncate max-w-[150px] block" title="${req.reason}">${req.reason}</span>
                    </td>
                    <td class="px-5 py-4">
                        <span class="text-[10px] font-bold text-neutral-400 font-mono">${date}</span>
                    </td>
                    <td class="px-5 py-4 text-center">
                        <span class="inline-block px-2 py-1 text-[9px] font-black uppercase tracking-widest border ${statusConfig.class}">
                            ${statusConfig.text}
                        </span>
                    </td>
                    <td class="px-5 py-4 text-center">
                        <button onclick="AdminReturns.openModal(${req.requestId})" class="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4">
                            Chi tiết
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    getStatusConfig(status) {
        switch (status) {
            case 'PENDING': return { text: 'Chờ duyệt', class: 'text-amber-600 bg-amber-50 border-amber-100' };
            case 'APPROVED': return { text: 'Chấp nhận', class: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
            case 'REJECTED': return { text: 'Từ chối', class: 'text-rose-600 bg-rose-50 border-rose-100' };
            case 'COMPLETED': return { text: 'Hoàn tất', class: 'text-blue-600 bg-blue-50 border-blue-100' };
            default: return { text: status, class: 'text-neutral-400 bg-neutral-50 border-neutral-100' };
        }
    },

    renderPagination(data) {
        const info = document.getElementById('pagination-info');
        const buttons = document.getElementById('pagination-buttons');
        
        info.innerHTML = `Hiển thị <b>${data.size * data.number + 1} - ${Math.min(data.size * (data.number + 1), data.totalElements)}</b> trên tổng số <b>${data.totalElements}</b>`;
        
        let html = '';
        // Prev
        html += `<button onclick="AdminReturns.changePage(${data.number - 1})" ${data.first ? 'disabled' : ''} class="p-1.5 border border-neutral-200 disabled:opacity-30 hover:bg-neutral-50 transition-colors"><span class="material-symbols-outlined text-[18px]">chevron_left</span></button>`;
        
        // Pages
        for (let i = 0; i < data.totalPages; i++) {
            if (i === data.number) {
                html += `<button class="w-8 h-8 bg-black text-white text-[10px] font-black">${i + 1}</button>`;
            } else if (i < 3 || i > data.totalPages - 4 || (i > data.number - 2 && i < data.number + 2)) {
                html += `<button onclick="AdminReturns.changePage(${i})" class="w-8 h-8 border border-neutral-200 text-[10px] font-bold hover:bg-neutral-50">${i + 1}</button>`;
            } else if (i === 3 || i === data.totalPages - 4) {
                html += `<span class="px-1 text-neutral-300">...</span>`;
            }
        }

        // Next
        html += `<button onclick="AdminReturns.changePage(${data.number + 1})" ${data.last ? 'disabled' : ''} class="p-1.5 border border-neutral-200 disabled:opacity-30 hover:bg-neutral-50 transition-colors"><span class="material-symbols-outlined text-[18px]">chevron_right</span></button>`;
        
        buttons.innerHTML = html;
    },

    changePage(page) {
        this.currentPage = page;
        this.fetchReturnRequests();
    },

    showLoading(show) {
        if (show) {
            this.loadingState.classList.remove('hidden');
            this.tableBody.classList.add('opacity-40');
        } else {
            this.loadingState.classList.add('hidden');
            this.tableBody.classList.remove('opacity-40');
        }
    },

    async openModal(requestId) {
        this.currentRequestId = requestId;
        this.modal.classList.remove('hidden');
        this.modalLoading.classList.remove('hidden');
        this.modalContent.classList.add('hidden');
        
        // Reset rejection area
        this.hideRejectionInput();

        try {
            const response = await fetch(`/api/admin/return-requests/${requestId}`);
            const req = await response.json();

            document.getElementById('modal-request-id').textContent = `YÊU CẦU #RR-${String(req.requestId).padStart(5, '0')}`;
            document.getElementById('modal-request-date').textContent = new Date(req.requestDate).toLocaleString('vi-VN');
            document.getElementById('modal-customer-name').textContent = req.customerName;
            document.getElementById('modal-customer-email').textContent = req.customerEmail;
            document.getElementById('modal-order-id').textContent = `ORDER #${req.orderId}`;
            document.getElementById('view-order-link').href = `/admin/orders?orderId=${req.orderId}`;
            document.getElementById('modal-reason').textContent = req.reason;
            document.getElementById('modal-description').textContent = req.description || '(Không có mô tả chi tiết)';

            // Images
            const imagesContainer = document.getElementById('modal-evidence-images');
            const noImagesState = document.getElementById('no-images-state');
            
            if (req.imageUrls && req.imageUrls.length > 0) {
                noImagesState.classList.add('hidden');
                imagesContainer.classList.remove('hidden');
                imagesContainer.innerHTML = req.imageUrls.map(url => `
                    <div class="relative aspect-square border border-neutral-100 overflow-hidden group cursor-zoom-in">
                        <img src="${url}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onclick="window.open('${url}', '_blank')">
                    </div>
                `).join('');
            } else {
                imagesContainer.classList.add('hidden');
                noImagesState.classList.remove('hidden');
            }

            // Rejection reason view
            const rejectionView = document.getElementById('rejection-result');
            if (req.status === 'REJECTED' && req.rejectionReason) {
                rejectionView.classList.remove('hidden');
                document.getElementById('modal-rejection-reason').textContent = req.rejectionReason;
            } else {
                rejectionView.classList.add('hidden');
            }

            // Actions visibility
            const actions = document.getElementById('modal-actions');
            if (req.status === 'PENDING') {
                actions.classList.remove('hidden');
            } else {
                actions.classList.add('hidden');
            }

            this.modalLoading.classList.add('hidden');
            this.modalContent.classList.remove('hidden');
        } catch (error) {
            console.error('Error fetching detail:', error);
            this.showToast('Không thể tải chi tiết yêu cầu', 'error');
            this.closeModal();
        }
    },

    closeModal() {
        this.modal.classList.add('hidden');
        this.currentRequestId = null;
    },

    showRejectionInput() {
        document.getElementById('modal-actions').classList.add('hidden');
        document.getElementById('rejection-input-area').classList.remove('hidden');
    },

    hideRejectionInput() {
        document.getElementById('modal-actions').classList.remove('hidden');
        document.getElementById('rejection-input-area').classList.add('hidden');
        document.getElementById('rejection-reason-input').value = '';
    },

    async approveRequest() {
        if (!confirm('Bạn có chắc chắn muốn CHẤP NHẬN yêu cầu hoàn trả này?')) return;
        
        this.processRequest('APPROVED');
    },

    async confirmReject() {
        const reason = document.getElementById('rejection-reason-input').value.trim();
        if (!reason) {
            this.showToast('Vui lòng nhập lý do từ chối', 'warning');
            return;
        }

        this.processRequest('REJECTED', reason);
    },

    async processRequest(newStatus, rejectionReason = '') {
        try {
            const response = await fetch(`/api/admin/return-requests/${this.currentRequestId}/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newStatus: newStatus,
                    rejectionReason: rejectionReason
                })
            });

            const result = await response.json();
            if (response.ok) {
                this.showToast(newStatus === 'APPROVED' ? 'Đã chấp nhận yêu cầu' : 'Đã từ chối yêu cầu', 'success');
                this.closeModal();
                this.fetchReturnRequests();
            } else {
                this.showToast(result.message || 'Lỗi khi xử lý yêu cầu', 'error');
            }
        } catch (error) {
            console.error('Error processing request:', error);
            this.showToast('Lỗi kết nối máy chủ', 'error');
        }
    },

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('admin-toast');
        if (!toastContainer) return;

        const config = {
            success: { bg: 'bg-emerald-500', icon: 'check_circle' },
            error: { bg: 'bg-rose-500', icon: 'error' },
            warning: { bg: 'bg-amber-500', icon: 'warning' }
        };

        const { bg, icon } = config[type] || config.success;
        const toast = document.createElement('div');
        toast.className = `flex items-center gap-3 ${bg} text-white px-4 py-3 shadow-xl transform transition-all duration-300 translate-y-10 opacity-0`;
        toast.innerHTML = `
            <span class="material-symbols-outlined text-[18px]">${icon}</span>
            <span class="text-[10px] font-black uppercase tracking-widest">${message}</span>
        `;

        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
        }, 10);

        setTimeout(() => {
            toast.classList.add('translate-y-[-10px]', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => AdminReturns.init());
