package org.example.fashionstoresystem.service.wishlist_item;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.WishlistItemResponseDTO;
import org.example.fashionstoresystem.dto.response.WishlistToggleResponseDTO;
import org.example.fashionstoresystem.entity.jpa.Product;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.entity.jpa.WishlistItem;
import org.example.fashionstoresystem.repository.ProductRepository;
import org.example.fashionstoresystem.repository.UserRepository;
import org.example.fashionstoresystem.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public List<WishlistItemResponseDTO> getWishlist(Long userId) {
        List<WishlistItem> items = wishlistItemRepository.findByUserId(userId);

        // AF1: Danh sách mục yêu thích trống -> trả về list rỗng, Controller/View sẽ hiển thị thông báo
        return items.stream()
                .map(item -> WishlistItemResponseDTO.builder()
                        .wishlistItemId(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productPrice(
                                item.getProduct().getVariants().isEmpty()
                                        ? 0.0
                                        : item.getProduct().getVariants().get(0).getPrice()
                        )
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public WishlistToggleResponseDTO toggleWishlist(Long userId, Long productId) {
        Optional<WishlistItem> existing = wishlistItemRepository.findByUserIdAndProductId(userId, productId);

        if (existing.isPresent()) {
            // Đã yêu thích -> Bỏ yêu thích
            wishlistItemRepository.delete(existing.get());
            return WishlistToggleResponseDTO.builder()
                    .productId(productId)
                    .wishlisted(false)
                    .message("Đã xóa sản phẩm khỏi mục yêu thích.")
                    .build();
        } else {
            // Chưa yêu thích -> Thêm vào yêu thích
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

            WishlistItem newItem = WishlistItem.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistItemRepository.save(newItem);

            return WishlistToggleResponseDTO.builder()
                    .productId(productId)
                    .wishlisted(true)
                    .message("Đã thêm sản phẩm vào mục yêu thích.")
                    .build();
        }
    }

    @Override
    @Transactional
    public void removeWishlistItem(Long userId, Long wishlistItemId) {
        WishlistItem item = wishlistItemRepository.findById(wishlistItemId)
                .orElseThrow(() -> new RuntimeException("Mục yêu thích không tồn tại!"));

        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa mục yêu thích này!");
        }

        wishlistItemRepository.delete(item);
    }
}
