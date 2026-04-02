/**
 * Auth Utilities
 * Quản lý trạng thái đăng nhập từ phía Client.
 * Token được lưu trong HttpOnly Cookie (do Server quản lý),
 * nên JS không thể đọc trực tiếp token. Thay vào đó, ta lưu
 * thông tin user vào localStorage để hiển thị UI.
 */
const AuthUtils = (() => {
    const USER_KEY = 'hy_user';

    function saveUser(userData) {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }

    function getUser() {
        const data = localStorage.getItem(USER_KEY);
        return data ? JSON.parse(data) : null;
    }

    function removeUser() {
        localStorage.removeItem(USER_KEY);
    }

    function isAuthenticated() {
        return getUser() !== null;
    }

    /**
     * Cập nhật Header UI dựa trên trạng thái đăng nhập.
     * Gọi hàm này khi trang load xong.
     */
    function updateHeaderUI() {
        const user = getUser();
        const userDropdown = document.querySelector('.group\\/user');
        if (!userDropdown) return;

        // Redirect user icon to login if not authenticated
        const userIconLink = userDropdown.querySelector('a');
        if (userIconLink) {
            userIconLink.href = user ? '/personal-center' : '/login';
        }

        if (user) {
            // Đã đăng nhập: cập nhật dropdown menu
            const dropdownMenu = userDropdown.querySelector('.absolute');
            if (dropdownMenu) {
                // Thêm tên user vào đầu dropdown
                const existingGreeting = dropdownMenu.querySelector('.auth-greeting');
                if (!existingGreeting) {
                    const formatName = (name) => {
                        if (!name) return 'User';
                        return name.split(/\s+/).map(word => {
                            if (!word) return "";
                            return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
                        }).join(' ');
                    };
                    const displayName = formatName(user.fullName);

                    const greeting = document.createElement('div');
                    greeting.className = 'auth-greeting px-6 py-3 border-b border-outline/5';
                    greeting.innerHTML = `
                        <p class="text-[10px] font-black tracking-[0.15em] text-on-surface truncate">Hi, ${displayName}</p>
                        <p class="text-[8px] font-medium text-on-surface-variant/60 mt-0.5 truncate">${user.email || ''}</p>
                    `;
                    dropdownMenu.insertBefore(greeting, dropdownMenu.firstChild.nextSibling);
                }

                // Thay link Sign Out thành logout qua API
                const signOutLink = dropdownMenu.querySelector('a[href*="logout"]');
                if (signOutLink) {
                    signOutLink.href = '#';
                    signOutLink.addEventListener('click', async (e) => {
                        e.preventDefault();
                        await logout();
                    });
                }
            }
        } else {
            // Chưa đăng nhập: thay dropdown thành nút Sign In
            const dropdownMenu = userDropdown.querySelector('.absolute');
            if (dropdownMenu) {
                dropdownMenu.innerHTML = `
                    <div class="absolute -top-1.5 right-4 w-3 h-3 bg-white rotate-45 border-t border-l border-outline/10"></div>
                    <div class="p-5 text-center">
                        <p class="text-[10px] font-bold text-on-surface-variant mb-4">Welcome to H&Y</p>
                        <a href="/login" class="block w-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] py-3 hover:bg-zinc-800 transition-colors text-center">Sign In</a>
                        <p class="text-[9px] text-on-surface-variant mt-3">New here? <a href="/register" class="font-black text-primary uppercase tracking-wider hover:underline">Sign Up</a></p>
                    </div>
                `;
            }
        }
    }

    async function logout() {
        try {
            await fetch('/api/auth/cookie/logout', { method: 'POST' });
        } catch (e) {
            // Bỏ qua lỗi mạng
        }
        removeUser();
        // Clear the user's cart from local storage to prevent it from spilling over to guest session
        localStorage.removeItem('hy_ui_cart');
        window.location.href = '/';
    }

    return {
        saveUser,
        getUser,
        removeUser,
        isAuthenticated,
        updateHeaderUI,
        logout
    };
})();

// Tự động cập nhật Header khi trang load
document.addEventListener('DOMContentLoaded', () => {
    AuthUtils.updateHeaderUI();
});
