/**
 * Recently Viewed Management for Personal Center
 */

Object.assign(PersonalCenter, {
    /**
     * State for Recently Viewed Selection
     */
    recentlyViewedSelectionMode: false,
    selectedRecentlyViewedIds: new Set(),

    /**
     * Toggle Selection Mode for Recently Viewed
     */
    toggleRecentlyViewedSelectionMode() {
        this.recentlyViewedSelectionMode = !this.recentlyViewedSelectionMode;
        
        const controls = document.getElementById('selection-controls');
        const btnText = document.getElementById('select-btn-text');
        const btnIcon = document.getElementById('select-btn-icon');
        const overlays = document.querySelectorAll('.selection-overlay');
        const selectAllCheckbox = document.getElementById('select-all-recently-viewed');

        if (this.recentlyViewedSelectionMode) {
            // Enable Mode
            if (controls) controls.classList.remove('hidden');
            if (btnText) btnText.textContent = 'Cancel';
            if (btnIcon) btnIcon.textContent = 'close';
            overlays.forEach(el => {
                el.classList.remove('opacity-0', 'pointer-events-none');
                el.classList.add('opacity-100');
            });
        } else {
            // Disable Mode
            if (controls) controls.classList.add('hidden');
            if (btnText) btnText.textContent = 'Select';
            if (btnIcon) btnIcon.textContent = 'rule';
            overlays.forEach(el => {
                el.classList.add('opacity-0', 'pointer-events-none');
                el.classList.remove('opacity-100');
            });
            
            // Reset state
            this.selectedRecentlyViewedIds.clear();
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            document.querySelectorAll('.item-checkbox').forEach(cb => cb.checked = false);
            this.updateDeleteButtonState();
        }
    },

    /**
     * Select All / Deselect All
     */
    toggleSelectAllRecentlyViewed(checked) {
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = checked;
            const item = cb.closest('.recently-viewed-item');
            if (!item) return;
            const productId = parseInt(item.dataset.productId);
            if (checked) {
                this.selectedRecentlyViewedIds.add(productId);
            } else {
                this.selectedRecentlyViewedIds.delete(productId);
            }
        });
        this.updateDeleteButtonState();
    },

    /**
     * Individual selection change
     */
    onRecentlyViewedSelectionChange(productId) {
        const item = document.querySelector(`.recently-viewed-item[data-product-id="${productId}"]`);
        if (!item) return;
        const cb = item.querySelector('.item-checkbox');
        
        if (cb.checked) {
            this.selectedRecentlyViewedIds.add(productId);
        } else {
            this.selectedRecentlyViewedIds.delete(productId);
            // Uncheck "Select All" if one is unchecked
            const selectAll = document.getElementById('select-all-recently-viewed');
            if (selectAll) selectAll.checked = false;
        }
        this.updateDeleteButtonState();
    },

    /**
     * Update Delete Button Count and Disabled state
     */
    updateDeleteButtonState() {
        const btn = document.getElementById('delete-selected-btn');
        if (!btn) return;

        const count = this.selectedRecentlyViewedIds.size;
        btn.textContent = `Delete Selected (${count})`;
        btn.disabled = count === 0;
    },

    /**
     * Delete Selected Items from Backend
     */
    async deleteSelectedRecentlyViewed() {
        if (this.selectedRecentlyViewedIds.size === 0) return;

        if (typeof AuthUtils === 'undefined') return;
        const user = AuthUtils.getUser();
        if (!user) return;

        const productIds = Array.from(this.selectedRecentlyViewedIds).join(',');
        
        try {
            const response = await fetch(`/api/recently-viewed?productIds=${productIds}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove from DOM
                this.selectedRecentlyViewedIds.forEach(id => {
                    const el = document.querySelector(`.recently-viewed-item[data-product-id="${id}"]`);
                    if (el) {
                        el.style.transform = 'scale(0.8)';
                        el.style.opacity = '0';
                        setTimeout(() => el.remove(), 300);
                    }
                });

                if (window.Toast) Toast.success('Đã xóa sản phẩm khỏi lịch sử!');
                
                // Check if grid is empty after deletions
                setTimeout(() => {
                    const grid = document.getElementById('recently-viewed-grid');
                    if (grid && grid.children.length === 0) {
                        location.reload(); // Show empty state
                    }
                }, 400);

                this.toggleRecentlyViewedSelectionMode(); // Reset mode
            } else {
                if (window.Toast) Toast.error('Lỗi khi xóa sản phẩm!');
            }
        } catch (error) {
            console.error('Error deleting recently viewed items:', error);
            if (window.Toast) Toast.error('Đã xảy ra lỗi hệ thống!');
        }
    }
});
