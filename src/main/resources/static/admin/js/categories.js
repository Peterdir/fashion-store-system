/**
 * AdminCategories - Module quản lý danh mục sản phẩm (H&Y Admin)
 */
const AdminCategories = (function() {
    // State
    let categories = [];
    let filteredCategories = [];
    let currentCategoryId = null;

    // Elements
    const elements = {
        tableBody: document.getElementById('categories-table-body'),
        emptyState: document.getElementById('categories-empty'),
        loadingState: document.getElementById('categories-loading'),
        filterKeyword: document.getElementById('filter-keyword'),
        modal: document.getElementById('category-modal'),
        form: document.getElementById('category-form'),
        modalTitle: document.getElementById('modal-title'),
        modalSubtitle: document.getElementById('modal-subtitle'),
        formId: document.getElementById('form-category-id'),
        formName: document.getElementById('form-name'),
        formParentId: document.getElementById('form-parent-id'),
        deleteModal: document.getElementById('delete-modal'),
        deleteName: document.getElementById('delete-category-name'),
        confirmDeleteBtn: document.getElementById('btn-confirm-delete'),
        toastContainer: document.getElementById('admin-toast')
    };

    // Initialize
    async function init() {
        console.log('AdminCategories initialized');
        await fetchCategories();
        
        // Event Listeners
        elements.filterKeyword.addEventListener('input', handleFilter);
        elements.form.addEventListener('submit', handleSubmit);
    }

    // Fetch Data
    async function fetchCategories() {
        showLoading(true);
        try {
            const response = await fetch('/api/admin/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            categories = await response.ok ? await response.json() : [];
            filteredCategories = [...categories];
            renderTable();
            updateParentOptions();
        } catch (error) {
            console.error('Error fetching categories:', error);
            showToast('Lỗi khi tải danh sách danh mục', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Render Table
    function renderTable() {
        if (filteredCategories.length === 0) {
            elements.tableBody.innerHTML = '';
            elements.emptyState.classList.remove('hidden');
            return;
        }

        elements.emptyState.classList.add('hidden');
        elements.tableBody.innerHTML = filteredCategories.map(cat => `
            <tr class="hover:bg-neutral-50/50 transition-colors group">
                <td class="px-5 py-4 text-[11px] font-bold text-neutral-400">#${cat.id}</td>
                <td class="px-5 py-4">
                    <span class="text-[12px] font-black text-primary uppercase tracking-tight">${cat.name}</span>
                </td>
                <td class="px-5 py-4">
                    ${cat.parentName ? `
                        <span class="px-2 py-1 bg-neutral-100 text-neutral-500 text-[9px] font-black uppercase tracking-widest rounded">
                            ${cat.parentName}
                        </span>
                    ` : '<span class="text-neutral-300 text-[10px] font-medium italic">Gốc</span>'}
                </td>
                <td class="px-5 py-4 text-center">
                    <span class="text-[11px] font-bold text-neutral-500">${cat.childCount}</span>
                </td>
                <td class="px-5 py-4">
                    <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="AdminCategories.openModal(${cat.id})" class="p-1.5 text-neutral-400 hover:text-primary hover:bg-white border border-transparent hover:border-neutral-200 transition-all">
                            <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onclick="AdminCategories.openDeleteModal(${cat.id}, '${cat.name}')" class="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-white border border-transparent hover:border-neutral-200 transition-all">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Filter Logic
    function handleFilter() {
        const keyword = elements.filterKeyword.value.toLowerCase().trim();
        filteredCategories = categories.filter(cat => 
            cat.name.toLowerCase().includes(keyword) || 
            (cat.parentName && cat.parentName.toLowerCase().includes(keyword))
        );
        renderTable();
    }

    function resetFilters() {
        elements.filterKeyword.value = '';
        filteredCategories = [...categories];
        renderTable();
    }

    // Modal Operations
    function openModal(id = null) {
        currentCategoryId = id;
        elements.form.reset();
        updateParentOptions(); // Refresh options excluding self if editing

        if (id) {
            const cat = categories.find(c => c.id === id);
            if (cat) {
                elements.modalTitle.innerText = 'Chỉnh Sửa Danh Mục';
                elements.modalSubtitle.innerText = `Cập nhật thông tin cho #${id}`;
                elements.formId.value = cat.id;
                elements.formName.value = cat.name;
                elements.formParentId.value = cat.parentId || '';
            }
        } else {
            elements.modalTitle.innerText = 'Thêm Danh Mục Mới';
            elements.modalSubtitle.innerText = 'Điền thông tin danh mục bên dưới';
            elements.formId.value = '';
        }

        elements.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        elements.modal.classList.add('hidden');
        document.body.style.overflow = '';
        currentCategoryId = null;
    }

    function updateParentOptions() {
        // Only allow parent if not self and not a descendant (keeping it simple for now: excluding self only)
        const options = categories
            .filter(cat => cat.id !== currentCategoryId)
            .map(cat => `<option value="${cat.id}">${cat.name}</option>`)
            .join('');
        
        elements.formParentId.innerHTML = '<option value="">(Không có danh mục cha)</option>' + options;
    }

    // Submit Logic
    async function handleSubmit(e) {
        e.preventDefault();
        const id = elements.formId.value;
        const data = {
            name: elements.formName.value.trim(),
            parentId: elements.formParentId.value ? parseInt(elements.formParentId.value) : null
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/categories/${id}` : '/api/admin/categories';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Lỗi khi lưu danh mục');
            }

            showToast(id ? 'Cập nhật danh mục thành công' : 'Thêm danh mục mới thành công', 'success');
            closeModal();
            fetchCategories();
        } catch (error) {
            console.error('Submit error:', error);
            showToast(error.message, 'error');
        }
    }

    // Delete Operations
    function openDeleteModal(id, name) {
        currentCategoryId = id;
        elements.deleteName.innerText = name;
        elements.deleteModal.classList.remove('hidden');
        elements.confirmDeleteBtn.onclick = () => handleDelete(id);
    }

    function closeDeleteModal() {
        elements.deleteModal.classList.add('hidden');
    }

    async function handleDelete(id) {
        try {
            const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Lỗi khi xóa danh mục');
            
            showToast('Đã xóa danh mục thành công', 'success');
            closeDeleteModal();
            fetchCategories();
        } catch (error) {
            console.error('Delete error:', error);
            showToast(error.message, 'error');
        }
    }

    // UI Helpers
    function showLoading(isLoading) {
        if (isLoading) {
            elements.tableBody.classList.add('hidden');
            elements.loadingState.classList.remove('hidden');
        } else {
            elements.tableBody.classList.remove('hidden');
            elements.loadingState.classList.add('hidden');
        }
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-black' : 'bg-red-600';
        const icon = type === 'success' ? 'check_circle' : 'error';
        
        toast.className = `${bgColor} text-white px-6 py-3 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300`;
        toast.innerHTML = `
            <span class="material-symbols-outlined text-[20px]">${icon}</span>
            <span class="text-[11px] font-black uppercase tracking-widest">${message}</span>
        `;
        
        elements.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Export public methods
    return {
        init,
        openModal,
        closeModal,
        openDeleteModal,
        closeDeleteModal,
        resetFilters
    };
})();

// Load on DOM ready
document.addEventListener('DOMContentLoaded', AdminCategories.init);
