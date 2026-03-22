package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // Tải toàn bộ giỏ hàng của khách
    List<CartItem> findByUserId(Long userId);
    
    // Kiểm tra loại hàng này đã có trong giỏ chưa (để cộng dồn số lượng)
    Optional<CartItem> findByUserIdAndProductVariantId(Long userId, Long variantId);

    // Cho tính năng Mua 1 vài món trong giỏ: Chỉ xóa những ProductVariant (áo quần) đã được tick chọn để thanh toán
    void deleteByUserIdAndProductVariantIdIn(Long userId, List<Long> variantIds);
}
