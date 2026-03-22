package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.example.fashionstoresystem.entity.enums.OrderStatus;

import org.springframework.data.domain.Pageable;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Lấy Lịch sử mua hàng của 1 Khách hàng. Xếp TỪ MỚI NHẤT ĐẾN CŨ NHẤT
    // (OrderByOrderDateDesc)
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Dành cho Admin: Liệt kê các Đơn hàng theo Trạng thái (Ví dụ: "CHỜ XÁC NHẬN")
    // + Có phân trang
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    // Lấy đơn hàng bằng ID NHƯNG bắt buộc Đơn hàng đó phải thuộc Khóa ngoại của
    // chính nó!
    Optional<Order> findByIdAndUserId(Long orderId, Long userId);

    // Lấy đơn hàng của Khách để Thanh toán (Chỉ lấy đơn có trạng thái Chờ thanh
    // toán / Lỗi)
    Optional<Order> findByIdAndUserIdAndStatusIn(Long orderId, Long userId, List<OrderStatus> statuses);

    // Dành cho Cron Job: Tìm các đơn "CHỜ THANH TOÁN" đã quá hạn (VD: 10 phút) để
    // hệ thống tự động Hủy
    List<Order> findByStatusAndOrderDateBefore(OrderStatus status, Date timeLimit);

    // Thống kê doanh thu: Lọc đơn hàng TỪ NGÀY ... ĐẾN NGÀY ... thuộc các Trạng thái lấy được tiền (VD: Đã thanh toán, Hoàn tất)
    List<Order> findByOrderDateBetweenAndStatusIn(Date startDate, Date endDate, List<OrderStatus> statuses);
}
