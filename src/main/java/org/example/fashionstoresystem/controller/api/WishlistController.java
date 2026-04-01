package org.example.fashionstoresystem.controller.api;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.WishlistItemResponseDTO;
import org.example.fashionstoresystem.dto.response.WishlistToggleResponseDTO;
import org.example.fashionstoresystem.service.wishlist_item.WishlistService;
import org.example.fashionstoresystem.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    // LẤY DANH SÁCH YÊU THÍCH
    @GetMapping
    public ResponseEntity<List<WishlistItemResponseDTO>> getWishlist() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(wishlistService.getWishlist(userId));
    }

    // TOGGLE YÊU THÍCH
    @PostMapping("/toggle")
    public ResponseEntity<WishlistToggleResponseDTO> toggleWishlist(
            @RequestParam Long productId
    ) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(
                wishlistService.toggleWishlist(userId, productId)
        );
    }

    // XÓA KHỎI DANH SÁCH
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeWishlistItem(
            @PathVariable Long itemId
    ) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        wishlistService.removeWishlistItem(userId, itemId);
        return ResponseEntity.noContent().build();
    }
}
