/**
 * Toast Notification System
 * Hiển thị thông báo nhỏ gọn ở góc trên bên phải màn hình.
 * Hỗ trợ 4 loại: success, error, warning, info
 */
const Toast = (() => {
    let container = null;

    function getContainer() {
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none';
            document.body.appendChild(container);
        }
        return container;
    }

    const ICONS = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    const COLORS = {
        success: { bg: 'bg-white', border: 'border-transparent', text: 'text-[#1a1c1c]', icon: 'text-[#58b76c]', bar: 'bg-[#58b76c]' },
        error:   { bg: 'bg-white', border: 'border-transparent', text: 'text-[#1a1c1c]', icon: 'text-red-500', bar: 'bg-red-500' },
        warning: { bg: 'bg-white', border: 'border-transparent', text: 'text-[#1a1c1c]', icon: 'text-amber-500', bar: 'bg-amber-500' },
        info:    { bg: 'bg-white', border: 'border-transparent', text: 'text-[#1a1c1c]', icon: 'text-blue-500', bar: 'bg-blue-500' }
    };

    /**
     * Show a toast notification
     */
    function show(message, type = 'info', duration = 3000) {
        const c = COLORS[type] || COLORS.info;
        const icon = ICONS[type] || ICONS.info;
        const wrapper = getContainer();

        const toast = document.createElement('div');
        // Shadow and animation to match screenshot feel
        toast.className = `pointer-events-auto min-w-[260px] max-w-[400px] ${c.bg} shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-outline/5 rounded-sm overflow-hidden transform translate-y-4 opacity-0 transition-all duration-500 ease-out relative`;
        toast.innerHTML = `
            <div class="flex items-center gap-4 px-6 py-5">
                <span class="material-symbols-outlined ${c.icon} text-[36px] flex-shrink-0" style="font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48">${icon}</span>
                <div class="flex-grow">
                    <p class="${c.text} text-[16px] font-medium tracking-tight">${message}</p>
                </div>
                <button class="toast-close ml-2 text-on-surface-variant/20 hover:text-on-surface-variant transition-colors">
                    <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>
            <div class="absolute bottom-0 left-0 h-[2px] ${c.bar} toast-progress" style="width: 100%; transition: width ${duration}ms linear;"></div>
        `;

        wrapper.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-4', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');
        });

        // Progress bar
        requestAnimationFrame(() => {
            const bar = toast.querySelector('.toast-progress');
            if (bar) bar.style.width = '0%';
        });

        // Auto remove
        setTimeout(() => removeToast(toast), duration);
    }

    function removeToast(toast) {
        toast.classList.add('translate-y-4', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 500);
    }

    return {
        success: (msg, duration) => show(msg, 'success', duration),
        error:   (msg, duration) => show(msg, 'error', duration),
        warning: (msg, duration) => show(msg, 'warning', duration),
        info:    (msg, duration) => show(msg, 'info', duration)
    };
})();
