/**
 * Wishlist Utilities
 * Quản lý danh sách yêu thích và cập nhật UI toàn cục.
 */
const WishlistUtils = (() => {
    const WISHLIST_BADGE_ID = 'header-wishlist-count';

    /**
     * Cập nhật Badge số lượng yêu thích trên Header
     */
    async function updateWishlistBadge() {
        const user = AuthUtils.getUser();
        const badge = document.getElementById(WISHLIST_BADGE_ID);
        if (!badge) return;

        if (!user) {
            badge.classList.add('hidden');
            return;
        }

        try {
            const response = await fetch(`/api/wishlists?userId=${user.userId}`);
            if (response.ok) {
                const items = await response.json();
                const count = items.length;
                
                if (count > 0) {
                    badge.textContent = count;
                    badge.classList.remove('hidden');
                    badge.classList.add('flex');
                } else {
                    badge.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Error fetching wishlist count:', error);
        }
    }

    /**
     * Toggle trạng thái yêu thích của sản phẩm
     */
    async function toggleWishlist(productId) {
        const user = AuthUtils.getUser();
        if (!user) {
            if (window.Toast) Toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích!');
            return null;
        }

        try {
            const response = await fetch(`/api/wishlists/toggle?userId=${user.userId}&productId=${productId}`, {
                method: 'POST'
            });

            if (response.ok) {
                const result = await response.json();
                if (window.Toast) {
                    Toast.success(result.wishlisted ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
                }
                updateWishlistBadge(); // Cập nhật lại số lượng trên header
                return result;
            } else {
                throw new Error('Không thể cập nhật danh sách yêu thích');
            }
        } catch (error) {
            console.error('Wishlist toggle error:', error);
            if (window.Toast) Toast.error('Lỗi kết nối máy chủ!');
            return null;
        }
    }

    /**
     * Kiểm tra xem sản phẩm có trong wishlist không
     */
    async function checkWishlistStatus(productId) {
        const user = AuthUtils.getUser();
        if (!user) return false;

        try {
            const response = await fetch(`/api/wishlists?userId=${user.userId}`);
            if (response.ok) {
                const items = await response.json();
                return items.some(item => item.productId.toString() === productId.toString());
            }
        } catch (error) {
            console.error('Error checking wishlist status:', error);
        }
        return false;
    }

    return {
        updateWishlistBadge,
        toggleWishlist,
        checkWishlistStatus
    };
})();

// Tự động cập nhật badge khi load trang
document.addEventListener('DOMContentLoaded', () => {
    WishlistUtils.updateWishlistBadge();
});
