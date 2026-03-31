package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Lấy tất cả OrderItem của 1 đơn hàng
    List<OrderItem> findByOrderId(Long orderId);

    // Kiểm tra Khách hàng X đã mua thành công Sản phẩm Y chưa (để cấp quyền Đánh giá)
    boolean existsByOrderUserIdAndStatusAndProductVariantProductId(Long userId, OrderStatus status, Long productId);

    // Lấy tất cả OrderItem của 1 đơn theo trạng thái cụ thể
    List<OrderItem> findByOrderIdAndStatus(Long orderId, OrderStatus status);

    // Truy vấn dành cho UI Cá nhân: Tách mảnh sản phẩm dựa vào Phân luồng Status và User
    Page<OrderItem> findByOrderUserIdAndStatusInAndOrderHiddenByUserOrderByOrderOrderDateDesc(Long userId, List<OrderStatus> statuses, boolean hidden, Pageable pageable);

}
