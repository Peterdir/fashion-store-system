package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.enums.OrderType;
import org.example.fashionstoresystem.entity.jpa.Order;
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
}
