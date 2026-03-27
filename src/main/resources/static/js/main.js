// Frontend logic for Digital Curator
console.log('Digital Curator UX Loaded');

document.addEventListener('DOMContentLoaded', () => {
    // Shopping Cart Interactions
    const cartContainer = document.querySelector('main');
    if (!cartContainer) return;

    // 1. Quantity Management
    const updateQuantity = (btn, delta) => {
        const row = btn.closest('.flex-col.md\\:flex-row');
        if (!row) return;
        const qtyVal = row.querySelector('.qty-val');
        if (!qtyVal) return;

        let currentQty = parseInt(qtyVal.textContent);
        let newQty = currentQty + delta;

        if (newQty >= 1) {
            qtyVal.textContent = newQty;
            // Here you would typically trigger an API call to update the backend
            // For now, we just update the UI
            updateTotals();
        }
    };

    cartContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.qty-btn');
        if (btn) {
            if (btn.classList.contains('plus')) updateQuantity(btn, 1);
            if (btn.classList.contains('minus')) updateQuantity(btn, -1);
        }

        // 2. Delete Item
        const deleteBtn = e.target.closest('.delete-item');
        if (deleteBtn) {
            const itemRow = deleteBtn.closest('.p-8');
            if (itemRow) {
                if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                    itemRow.remove();
                    updateTotals();
                }
            }
        }
    });

    // 3. Select All Logic
    const selectAllCheckbox = document.getElementById('select-all');
    const itemCheckboxes = document.querySelectorAll('.item-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            itemCheckboxes.forEach(cb => {
                cb.checked = selectAllCheckbox.checked;
            });
            updateTotals();
        });
    }

    itemCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const allChecked = Array.from(itemCheckboxes).every(c => c.checked);
            if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
            updateTotals();
        });
    });

    // 4. Mock Update Totals (Visual Only)
    function updateTotals() {
        const items = document.querySelectorAll('.item-checkbox:checked');
        const summaryCount = document.querySelector('.lg\\:col-span-4 .font-black.uppercase.tracking-widest');
        if (summaryCount) {
            summaryCount.textContent = `${items.length} Sản phẩm đã chọn`;
        }

        // Note: Real price calculations would happen on the server or via a more robust state management
        console.log(`Updated cart with ${items.length} items checked.`);
    }
});
