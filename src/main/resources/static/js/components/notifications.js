/**
 * Notification Manager for Fashion Store
 */
const NotificationManager = {
    init() {
        this.listElement = document.getElementById('notification-list');
        this.badgeElement = document.getElementById('notification-unread-count');
        this.markAllBtn = document.getElementById('mark-all-read-btn');
        
        if (!this.listElement) return;

        this.fetchNotifications();
        this.setupEventListeners();
        
        // Polling every 60 seconds
        setInterval(() => this.fetchNotifications(), 60000);
    },

    setupEventListeners() {
        if (this.markAllBtn) {
            this.markAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.markAllAsRead();
            });
        }
    },

    async fetchNotifications() {
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const notifications = await response.json();
                this.renderNotifications(notifications);
                this.updateBadge(notifications.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    },

    async updateBadge(count) {
        if (!this.badgeElement) return;
        
        if (count > 0) {
            this.badgeElement.textContent = count > 9 ? '9+' : count;
            this.badgeElement.classList.remove('hidden');
            this.badgeElement.classList.add('flex');
        } else {
            this.badgeElement.classList.add('hidden');
            this.badgeElement.classList.remove('flex');
        }
    },

    renderNotifications(notifications) {
        if (!this.listElement) return;

        if (notifications.length === 0) {
            this.listElement.innerHTML = `
                <div class="px-6 py-10 text-center text-[10px] uppercase tracking-widest text-gray-400">
                    Không có thông báo mới
                </div>
            `;
            return;
        }

        this.listElement.innerHTML = notifications.map(n => {
            const date = new Date(n.createdAt).toLocaleDateString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit'
            });

            return `
                <div class="notification-item px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${n.read ? 'opacity-60' : 'bg-blue-50/30'}" 
                     onclick="NotificationManager.handleNotificationClick(${n.id}, ${n.relatedId})">
                    <div class="flex justify-between items-start mb-1">
                        <span class="text-[11px] font-black uppercase tracking-tight ${this.getTypeColor(n.type)}">${n.title}</span>
                        <span class="text-[8px] text-gray-400 font-medium">${date}</span>
                    </div>
                    <p class="text-[10px] text-gray-600 leading-relaxed line-clamp-2">${n.content}</p>
                </div>
            `;
        }).join('');
    },

    getTypeColor(type) {
        switch (type) {
            case 'SUCCESS': return 'text-emerald-600';
            case 'WARNING': return 'text-amber-600';
            case 'ERROR': return 'text-red-600';
            default: return 'text-blue-600';
        }
    },

    async handleNotificationClick(id, relatedId) {
        await this.markAsRead(id);
        if (relatedId) {
            window.location.href = `/personal-center?tab=orders&activeOrder=${relatedId}`;
        } else {
            this.fetchNotifications();
        }
    },

    async markAsRead(id) {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    },

    async markAllAsRead() {
        try {
            const response = await fetch('/api/notifications/read-all', { method: 'PUT' });
            if (response.ok) {
                this.fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    NotificationManager.init();
});
