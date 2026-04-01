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
    Page<OrderItem> findByOrderUserIdAndStatusInOrderByOrderOrderDateDesc(Long userId, List<OrderStatus> statuses, Pageable pageable);

    // Truy vấn có lọc trạng thái đánh giá (Dùng cho tab Đã giao & Đánh giá)
    Page<OrderItem> findByOrderUserIdAndStatusInAndIsReviewedOrderByOrderOrderDateDesc(Long userId, List<OrderStatus> statuses, boolean isReviewed, Pageable pageable);

    // Truy vấn các sản phẩm đã đánh giá (Dùng cho Lịch sử Review)
    Page<OrderItem> findByOrderUserIdAndIsReviewedTrueOrderByOrderOrderDateDesc(Long userId, Pageable pageable);

}
