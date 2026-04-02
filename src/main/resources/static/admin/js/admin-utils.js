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

/**
 * Admin Notifications
 */
const AdminNotifications = (() => {
    let notifList = [];

    async function fetchNotifications() {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                notifList = await res.json();
                renderNotifications();
                updateUnreadCount();
            }
        } catch (error) {
            console.error("Lỗi khi tải thông báo:", error);
        }
    }

    function updateUnreadCount() {
        const unreadCount = notifList.filter(n => !n.isRead).length;
        const dot = document.getElementById('admin-notif-dot');
        if (dot) {
            if (unreadCount > 0) {
                dot.classList.remove('hidden');
            } else {
                dot.classList.add('hidden');
            }
        }
    }

    function renderNotifications() {
        const listEl = document.getElementById('admin-notif-list');
        if (!listEl) return;

        if (notifList.length === 0) {
            listEl.innerHTML = `
                <div class="py-10 text-center">
                    <span class="material-symbols-outlined text-neutral-200 text-4xl mb-2">notifications_off</span>
                    <p class="text-[11px] text-neutral-400 font-medium">Không có thông báo nào</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = notifList.map(n => {
            const dateStr = new Date(n.createdAt).toLocaleString('vi-VN', {
                hour: '2-digit', minute: '2-digit', 
                day: '2-digit', month: '2-digit', year: 'numeric'
            });

            return `
                <div class="px-3 py-3 rounded cursor-pointer transition-colors relative mb-0.5 ${n.isRead ? 'hover:bg-neutral-50 opacity-80' : 'bg-neutral-50/80 hover:bg-neutral-100'}"
                     onclick="AdminNotifications.markAsRead(${n.id})">
                    ${!n.isRead ? '<span class="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_5px_rgba(176,38,0,0.5)]"></span>' : ''}
                    <div class="pr-5">
                        <p class="text-[11px] font-bold ${!n.isRead ? 'text-primary' : 'text-neutral-600'} mb-1">${n.title}</p>
                        <p class="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">${n.content}</p>
                        <p class="text-[9px] font-medium text-neutral-400 mt-2">${dateStr}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function markAsRead(id) {
        // Optimistic UI update
        const notif = notifList.find(n => n.id === id);
        if (notif && !notif.isRead) {
            notif.isRead = true;
            renderNotifications();
            updateUnreadCount();
            
            try {
                await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
            } catch (error) {
                console.error("Lỗi khi đánh dấu đã đọc", error);
                // Revert if failed
                notif.isRead = false;
                renderNotifications();
                updateUnreadCount();
            }
        }
    }

    async function markAllAsRead() {
        if (notifList.filter(n => !n.isRead).length === 0) return;
        
        // Optimistic UI
        const unreadNotifs = notifList.filter(n => !n.isRead);
        unreadNotifs.forEach(n => n.isRead = true);
        renderNotifications();
        updateUnreadCount();

        try {
            await fetch('/api/notifications/read-all', { method: 'PUT' });
        } catch (error) {
            console.error("Lỗi khi đánh dấu tất cả đã đọc", error);
            // Revert on failure
            unreadNotifs.forEach(n => n.isRead = false);
            renderNotifications();
            updateUnreadCount();
        }
    }

    function init() {
        if (document.getElementById('btn-admin-notifications')) {
            fetchNotifications();
            
            // Refresh logic: Lấy lại thông báo mỗi khi mở dropdown
            document.getElementById('btn-admin-notifications').addEventListener('click', () => {
                // Refresh slightly delayed to let the menu open
                setTimeout(fetchNotifications, 100);
            });

            // Polling ngầm mỗi 30 giây (tuỳ chọn)
            setInterval(fetchNotifications, 30000);
        }

        if (document.getElementById('btn-read-all-notifs')) {
            document.getElementById('btn-read-all-notifs').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                markAllAsRead();
            });
        }
    }

    return { init, fetchNotifications, markAsRead, markAllAsRead };
})();

// Khởi tạo toàn cục
document.addEventListener('DOMContentLoaded', () => {
    AdminUtils.initPriceInputs();
    AdminNotifications.init();
});
