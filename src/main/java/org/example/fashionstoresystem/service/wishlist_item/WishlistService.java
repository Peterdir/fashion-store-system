package org.example.fashionstoresystem.service.wishlist_item;

import org.example.fashionstoresystem.dto.response.WishlistItemResponseDTO;
import org.example.fashionstoresystem.dto.response.WishlistToggleResponseDTO;

import java.util.List;

public interface WishlistService {
    // UC10: Quản lý mục yêu thích
    List<WishlistItemResponseDTO> getWishlist(Long userId);
    WishlistToggleResponseDTO toggleWishlist(Long userId, Long productId);
    void removeWishlistItem(Long userId, Long wishlistItemId);
}
