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
        success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: 'text-emerald-500', bar: 'bg-emerald-500' },
        error:   { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800',     icon: 'text-red-500',     bar: 'bg-red-500' },
        warning: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800',   icon: 'text-amber-500',   bar: 'bg-amber-500' },
        info:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-800',    icon: 'text-blue-500',    bar: 'bg-blue-500' }
    };

    function show(message, type = 'info', duration = 4000) {
        const c = COLORS[type] || COLORS.info;
        const icon = ICONS[type] || ICONS.info;
        const wrapper = getContainer();

        const toast = document.createElement('div');
        toast.className = `pointer-events-auto min-w-[320px] max-w-[420px] ${c.bg} border ${c.border} shadow-lg overflow-hidden transform translate-x-full opacity-0 transition-all duration-500 ease-out`;
        toast.innerHTML = `
            <div class="flex items-start gap-3 px-5 py-4">
                <span class="material-symbols-outlined ${c.icon} text-xl flex-shrink-0 mt-0.5">${icon}</span>
                <div class="flex-grow">
                    <p class="${c.text} text-[11px] font-bold uppercase tracking-[0.1em] leading-relaxed">${message}</p>
                </div>
                <button class="toast-close flex-shrink-0 ${c.text} opacity-40 hover:opacity-100 transition-opacity">
                    <span class="material-symbols-outlined text-base">close</span>
                </button>
            </div>
            <div class="h-[3px] ${c.bar} toast-progress" style="width: 100%; transition: width ${duration}ms linear;"></div>
        `;

        wrapper.appendChild(toast);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
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
        toast.classList.add('translate-x-full', 'opacity-0');
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
