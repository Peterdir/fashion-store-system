package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.example.fashionstoresystem.entity.enums.OrderStatus;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Kiểm tra Khách hàng X đã mua thành công Sản phẩm Y chưa (để cấp quyền Đánh giá)
    boolean existsByOrderUserIdAndOrderStatusAndProductVariantProductId(Long userId, OrderStatus orderStatus,
            Long productId);
}
