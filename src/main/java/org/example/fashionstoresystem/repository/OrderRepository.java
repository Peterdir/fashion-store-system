package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.enums.OrderType;
import org.example.fashionstoresystem.entity.jpa.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Lấy Lịch sử mua hàng của 1 Khách hàng. Xếp TỪ MỚI NHẤT ĐẾN CŨ NHẤT (OrderByOrderDateDesc)
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Lấy đơn hàng theo orderId, nhưng đảm bảo đơn hàng đó thuộc về userId
    Optional<Order> findByIdAndUserId(Long orderId, Long userId);

    // Lấy tất cả đơn hàng trong khoảng thời gian
    List<Order> findByOrderDateBetween(Date startDate, Date endDate);

    // Tính tổng doanh thu theo loại đơn (ONLINE/OFFLINE) trong khoảng thời gian
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate AND o.type = :type")
    Double calculateTotalRevenue(@Param("startDate") Date startDate, @Param("endDate") Date endDate, @Param("type") OrderType type);

    // Đếm số lượng đơn hàng trong khoảng thời gian
    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    int countOrders(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN o.orderItems oi WHERE (?1 IS NULL OR oi.status = ?1) AND (CAST(?2 AS date) IS NULL OR o.orderDate >= ?2) AND (CAST(?3 AS date) IS NULL OR o.orderDate <= ?3)")
    Page<Order> searchOrders(OrderStatus status, Date startDate, Date endDate, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN o.orderItems oi WHERE o.user.id = :userId AND o.hiddenByUser = :hidden AND oi.status IN :statuses ORDER BY o.orderDate DESC")
    Page<Order> searchMyOrdersByStatuses(@Param("userId") Long userId, @Param("statuses") List<OrderStatus> statuses, @Param("hidden") boolean hidden, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN o.orderItems oi WHERE o.user.id = :userId AND o.hiddenByUser = :hidden ORDER BY o.orderDate DESC")
    Page<Order> findAllMyOrders(@Param("userId") Long userId, @Param("hidden") boolean hidden, Pageable pageable);

    // Tìm đơn hàng quá hạn thanh toán
    List<Order> findByStatusAndOrderDateBefore(OrderStatus status, Date expireTime);
}
