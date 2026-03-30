/**
 * Admin Products Management — H&Y Fashion Store
 * Gọi API từ AdminProductController + ProductController để quản lý sản phẩm.
 */
const AdminProducts = (() => {

    // ===== CONFIG =====
    const API = {
        LIST: '/api/admin/products',                  // GET  — admin, có pagination + keyword + status
        DETAIL: (id) => `/api/products/${id}`,        // GET  — chi tiết sản phẩm
        CREATE: '/api/admin/products',                // POST — tạo mới
        UPDATE: (id) => `/api/admin/products/${id}`,  // PUT  — cập nhật
        DELETE: (id) => `/api/admin/products/${id}`,  // DELETE — xóa
    };

    const PAGE_SIZE = 10;
    let currentPage = 0;
    let deleteTargetId = null;

    // ===== STATUS MAPS =====
    const STATUS_LABELS = {
        ACTIVE: 'Đang bán',
        INACTIVE: 'Tạm ẩn',
        OUT_OF_STOCK: 'Hết hàng',
        DISCONTINUED: 'Ngừng KD',
    };

    const STATUS_COLORS = {
        ACTIVE: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
        INACTIVE: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
        OUT_OF_STOCK: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
        DISCONTINUED: { bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' },
    };

    // ===== DOM REFERENCES =====
    const $ = (id) => document.getElementById(id);

    // ===== UTILITY FUNCTIONS =====
    function formatCurrency(amount) {
        if (!amount && amount !== 0) return '—';
        return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
    }

    function renderStatusBadge(status) {
        const c = STATUS_COLORS[status] || STATUS_COLORS.INACTIVE;
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

    // ===== FETCH PRODUCTS =====
    async function fetchProducts(page = 0) {
        const keyword = $('filter-keyword').value.trim();
        const status = $('filter-status').value;

        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', PAGE_SIZE);
        params.append('sort', 'id,desc');
        if (keyword) params.append('keyword', keyword);
        if (status) params.append('status', status);

        $('products-loading').classList.remove('hidden');
        $('products-empty').classList.add('hidden');
        $('products-table-body').innerHTML = '';
        $('products-pagination').classList.add('hidden');

        try {
            const res = await fetch(`${API.LIST}?${params.toString()}`);
            if (!res.ok) throw new Error('Lỗi khi tải danh sách sản phẩm');
            const data = await res.json();

            $('products-loading').classList.add('hidden');

            let products = data.content || [];

            if (products.length === 0) {
                $('products-empty').classList.remove('hidden');
                return;
            }

            renderTable(products);
            renderPagination(data);
            currentPage = data.number;
        } catch (err) {
            $('products-loading').classList.add('hidden');
            $('products-empty').classList.remove('hidden');
            showToast(err.message, 'error');
        }
    }

    // ===== RENDER TABLE =====
    function renderTable(products) {
        const tbody = $('products-table-body');
        tbody.innerHTML = products.map(product => {
            const imgUrl = product.primaryImageUrl || '';
            const imgTag = imgUrl
                ? `<img src="${imgUrl}" alt="${product.name}" class="w-10 h-10 object-cover border border-neutral-100 flex-shrink-0" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%23f5f5f5%22 width=%2240%22 height=%2240%22/><text fill=%22%23ccc%22 font-size=%2212%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.35em%22>?</text></svg>'">`
                : `<div class="w-10 h-10 bg-neutral-100 flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-neutral-300 text-[18px]">image</span></div>`;

            return `<tr class="hover:bg-neutral-50/50 transition-colors">
                <td class="px-5 py-3">
                    <div class="flex items-center gap-3">
                        ${imgTag}
                        <div class="min-w-0">
                            <p class="text-[12px] font-bold text-primary truncate max-w-[220px]">${product.name}</p>
                            <p class="text-[10px] text-neutral-400 font-medium">ID: ${product.productId}</p>
                        </div>
                    </div>
                </td>
                <td class="px-5 py-3 text-[11px] font-bold text-neutral-600">${product.category || '—'}</td>
                <td class="px-5 py-3 text-[12px] font-bold text-primary text-right">${formatCurrency(product.price || product.minPrice)}</td>
                <td class="px-5 py-3 text-center">
                    <span class="text-[11px] font-bold text-neutral-600">—</span>
                </td>
                <td class="px-5 py-3 text-center">
                    <span class="text-[11px] font-bold text-neutral-600">—</span>
                </td>
                <td class="px-5 py-3 text-center">${renderStatusBadge(product.status)}</td>
                <td class="px-5 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <button onclick="AdminProducts.openEdit(${product.productId})" class="p-1.5 text-neutral-400 hover:text-accent hover:bg-neutral-100 rounded transition-colors" title="Sửa">
                            <span class="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onclick="AdminProducts.confirmDelete(${product.productId}, '${product.name.replace(/'/g, "\\'")}')" class="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Xóa">
                            <span class="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    // ===== RENDER PAGINATION =====
    function renderPagination(pageData) {
        const container = $('products-pagination');
        container.classList.remove('hidden');

        const start = pageData.number * pageData.size + 1;
        const end = Math.min(start + pageData.numberOfElements - 1, pageData.totalElements);
        $('pagination-info').textContent = `Hiển thị ${start}–${end} / ${pageData.totalElements} sản phẩm`;

        const btns = $('pagination-buttons');
        btns.innerHTML = '';

        // Previous
        btns.appendChild(createPageBtn('chevron_left', pageData.number - 1, pageData.first));

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
            btn.addEventListener('click', () => fetchProducts(i));
            btns.appendChild(btn);
        }

        // Next
        btns.appendChild(createPageBtn('chevron_right', pageData.number + 1, pageData.last));
    }

    function createPageBtn(icon, page, disabled) {
        const btn = document.createElement('button');
        btn.innerHTML = `<span class="material-symbols-outlined text-[16px]">${icon}</span>`;
        btn.className = `w-8 h-8 flex items-center justify-center ${disabled ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-500 hover:bg-neutral-100'} transition-colors`;
        btn.disabled = disabled;
        if (!disabled) btn.addEventListener('click', () => fetchProducts(page));
        return btn;
    }

    // ===== MODAL MANAGEMENT =====

    // --- Image URL Fields ---
    function addImageInput(value = '') {
        const container = $('image-urls-container');
        const count = container.children.length;
        if (count >= 10) {
            showToast('Tối đa 10 ảnh', 'warning');
            return;
        }

        const row = document.createElement('div');
        row.className = 'flex items-center gap-2 image-row';
        row.innerHTML = `
            <input type="url" placeholder="https://example.com/image.jpg" value="${value}"
                   class="image-url-input flex-1 px-3 py-2 text-[11px] font-medium border border-neutral-200 bg-neutral-50 outline-none focus:border-primary transition-colors">
            <button type="button" onclick="this.closest('.image-row').remove()" class="p-1.5 text-neutral-300 hover:text-red-500 transition-colors flex-shrink-0">
                <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
        `;
        container.appendChild(row);
    }

    // --- Variant Fields ---
    function addVariantRow(data = {}) {
        const container = $('variants-container');
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2 variant-row';
        row.innerHTML = `
            <input type="hidden" class="variant-id-input" value="${data.variantId || ''}">
            <input type="text" placeholder="Size (S, M, L...)" value="${data.size || ''}" required maxlength="20"
                   class="variant-size flex-1 px-3 py-2 text-[11px] font-medium border border-neutral-200 bg-neutral-50 outline-none focus:border-primary transition-colors">
            <input type="text" placeholder="Màu sắc" value="${data.color || ''}" required maxlength="50"
                   class="variant-color flex-1 px-3 py-2 text-[11px] font-medium border border-neutral-200 bg-neutral-50 outline-none focus:border-primary transition-colors">
            <input type="number" placeholder="Tồn kho" value="${data.stockQuantity ?? ''}" required min="0"
                   class="variant-stock w-24 px-3 py-2 text-[11px] font-medium border border-neutral-200 bg-neutral-50 outline-none focus:border-primary transition-colors">
            <button type="button" onclick="this.closest('.variant-row').remove()" class="p-1.5 text-neutral-300 hover:text-red-500 transition-colors flex-shrink-0">
                <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
        `;
        container.appendChild(row);
    }

    function resetForm() {
        $('product-form').reset();
        $('form-product-id').value = '';
        $('form-status-group').style.display = 'none';
        $('image-urls-container').innerHTML = '';
        $('variants-container').innerHTML = '';
        addImageInput();
        addVariantRow();
    }

    // --- Open modal for CREATE ---
    function openCreate() {
        resetForm();
        $('modal-title').textContent = 'Thêm Sản Phẩm Mới';
        $('modal-subtitle').textContent = 'Điền thông tin sản phẩm bên dưới';
        $('btn-submit').innerHTML = '<span class="material-symbols-outlined text-[14px]">add</span> Tạo Sản Phẩm';
        $('product-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // --- Open modal for EDIT ---
    async function openEdit(productId) {
        resetForm();
        $('modal-title').textContent = 'Chỉnh Sửa Sản Phẩm';
        $('modal-subtitle').textContent = `Đang tải thông tin sản phẩm #${productId}...`;
        $('btn-submit').innerHTML = '<span class="material-symbols-outlined text-[14px]">save</span> Cập Nhật';
        $('product-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        try {
            const res = await fetch(API.DETAIL(productId));
            if (!res.ok) throw new Error('Không thể tải thông tin sản phẩm');
            const product = await res.json();

            $('form-product-id').value = product.productId;
            $('form-name').value = product.name || '';
            $('form-category').value = product.category || product.categoryName || '';
            $('form-price').value = product.price || '';
            $('form-description').value = product.description || '';

            // Show status select for edit mode
            $('form-status-group').style.display = '';
            $('form-status').value = product.status || 'ACTIVE';

            // Populate images
            $('image-urls-container').innerHTML = '';
            if (product.images && product.images.length > 0) {
                product.images.forEach(img => addImageInput(img.url));
            } else {
                addImageInput();
            }

            // Populate variants
            $('variants-container').innerHTML = '';
            if (product.variants && product.variants.length > 0) {
                product.variants.forEach(v => addVariantRow(v));
            } else {
                addVariantRow();
            }

            $('modal-subtitle').textContent = `Chỉnh sửa: ${product.name}`;
        } catch (err) {
            showToast(err.message, 'error');
            closeModal();
        }
    }

    function closeModal() {
        $('product-modal').classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ===== FORM SUBMISSION =====
    async function handleSubmit(e) {
        e.preventDefault();

        const productId = $('form-product-id').value;
        const isEdit = !!productId;

        // Collect image URLs
        const imageInputs = document.querySelectorAll('.image-url-input');
        const imageUrls = [];
        imageInputs.forEach(input => {
            const val = input.value.trim();
            if (val) imageUrls.push(val);
        });

        if (imageUrls.length === 0) {
            showToast('Vui lòng thêm ít nhất một URL hình ảnh', 'warning');
            return;
        }

        // Collect variants
        const variantRows = document.querySelectorAll('.variant-row');
        const variants = [];
        let hasVariantError = false;

        variantRows.forEach(row => {
            const size = row.querySelector('.variant-size').value.trim();
            const color = row.querySelector('.variant-color').value.trim();
            const stock = row.querySelector('.variant-stock').value.trim();
            const variantId = row.querySelector('.variant-id-input')?.value || null;

            if (!size || !color || stock === '') {
                hasVariantError = true;
                return;
            }

            const variant = { size, color, stockQuantity: parseInt(stock) };
            if (isEdit && variantId) {
                variant.variantId = parseInt(variantId);
            }
            variants.push(variant);
        });

        if (hasVariantError || variants.length === 0) {
            showToast('Vui lòng điền đầy đủ thông tin biến thể', 'warning');
            return;
        }

        // Build payload
        const payload = {
            name: $('form-name').value.trim(),
            category: $('form-category').value.trim(),
            price: parseFloat($('form-price').value),
            description: $('form-description').value.trim(),
            imageUrls,
            variants,
        };

        if (isEdit) {
            payload.status = $('form-status').value;
        }

        // Disable button
        const btnSubmit = $('btn-submit');
        const originalHTML = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="material-symbols-outlined text-[14px] animate-spin">sync</span> Đang lưu...';

        try {
            const url = isEdit ? API.UPDATE(productId) : API.CREATE;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.status === 401 || res.status === 403) {
                window.location.href = '/admin/login';
                return;
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                // Handle validation errors
                if (err.errors) {
                    const messages = Object.values(err.errors).join('\n');
                    throw new Error(messages);
                }
                throw new Error(err.message || err.error || `Lỗi ${res.status}`);
            }

            showToast(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
            closeModal();
            fetchProducts(isEdit ? currentPage : 0);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalHTML;
        }
    }

    // ===== DELETE =====
    function confirmDelete(productId, productName) {
        deleteTargetId = productId;
        $('delete-product-name').textContent = productName;
        $('delete-modal').classList.remove('hidden');
    }

    function closeDeleteModal() {
        $('delete-modal').classList.add('hidden');
        deleteTargetId = null;
    }

    async function executeDelete() {
        if (!deleteTargetId) return;

        const btn = $('btn-confirm-delete');
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined text-[14px] animate-spin">sync</span> Đang xóa...';

        try {
            const res = await fetch(API.DELETE(deleteTargetId), { method: 'DELETE' });
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/admin/login';
                return;
            }
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Xóa sản phẩm thất bại');
            }

            showToast('Xóa sản phẩm thành công!');
            closeDeleteModal();
            fetchProducts(currentPage);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
        }
    }

    // ===== INIT =====
    function init() {
        // Filter buttons
        $('btn-filter').addEventListener('click', () => fetchProducts(0));
        $('btn-reset-filter').addEventListener('click', () => {
            $('filter-keyword').value = '';
            $('filter-status').value = '';
            fetchProducts(0);
        });

        // Search on Enter key
        $('filter-keyword').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') fetchProducts(0);
        });

        // Add product button
        $('btn-add-product').addEventListener('click', openCreate);

        // Image + Variant add buttons
        $('btn-add-image').addEventListener('click', () => addImageInput());
        $('btn-add-variant').addEventListener('click', () => addVariantRow());

        // Form submit
        $('product-form').addEventListener('submit', handleSubmit);

        // Delete confirm
        $('btn-confirm-delete').addEventListener('click', executeDelete);

        // Close modals on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
                closeDeleteModal();
            }
        });

        // Load initial data
        fetchProducts(0);
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return { openEdit, closeModal, confirmDelete, closeDeleteModal };
})();
