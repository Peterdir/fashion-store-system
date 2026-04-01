/**
 * Admin Utilities — H&Y Fashion Store
 * Global helpers for UI formatting and shared logic.
 */
const AdminUtils = (() => {

    /**
     * Định dạng chuỗi số có dấu phẩy ngăn cách hàng nghìn.
     * @param {string|number} value 
     * @returns {string}
     */
    function formatNumber(value) {
        if (!value && value !== 0) return '';
        // Xóa tất cả ký tự không phải số
        const cleanValue = value.toString().replace(/\D/g, '');
        if (!cleanValue) return '';
        // Định dạng có dấu phẩy
        return new Intl.NumberFormat('en-US').format(cleanValue);
    }

    /**
     * Loại bỏ dấu phẩy để lấy giá trị số thuần túy.
     * @param {string} value 
     * @returns {number}
     */
    function unformatNumber(value) {
        if (!value) return 0;
        return parseFloat(value.toString().replace(/,/g, '')) || 0;
    }

    /**
     * Gắn sự kiện định dạng tiền tệ real-time cho các input có class .price-format.
     */
    function initPriceInputs() {
        document.querySelectorAll('.price-format').forEach(input => {
            if (input.dataset.initialized) return;

            // Chuyển sang type text để hiển thị dấu phẩy
            if (input.type === 'number') {
                input.type = 'text';
            }

            input.addEventListener('input', (e) => {
                const cursorPosition = e.target.selectionStart;
                const oldLength = e.target.value.length;
                
                const formatted = formatNumber(e.target.value);
                e.target.value = formatted;
                
                // Điều chỉnh vị trí con trỏ sau khi thêm dấu phẩy
                const newLength = formatted.length;
                const newPos = cursorPosition + (newLength - oldLength);
                e.target.setSelectionRange(newPos, newPos);
            });

            input.dataset.initialized = "true";
        });
    }

    return { formatNumber, unformatNumber, initPriceInputs };
})();

// Khởi tạo toàn cục
document.addEventListener('DOMContentLoaded', () => {
    AdminUtils.initPriceInputs();
});
