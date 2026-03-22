package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    // Mở trang "Mục yêu thích" của khách hàng
    List<WishlistItem> findByUserId(Long userId);

    // Kiểm tra khách đã từng yêu thích món này chưa (để Thêm/Bỏ tim)
    Optional<WishlistItem> findByUserIdAndProductId(Long userId, Long productId);
}
