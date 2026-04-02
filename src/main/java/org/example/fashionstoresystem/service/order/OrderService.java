package org.example.fashionstoresystem.service.order;

import org.example.fashionstoresystem.dto.request.CancelOrderRequestDTO;
import org.example.fashionstoresystem.dto.request.PlaceOrderRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderDashboardSummaryDTO;
import org.example.fashionstoresystem.dto.response.OrderDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderSummaryResponseDTO;
import org.example.fashionstoresystem.dto.response.PlaceOrderResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderItemSummaryDTO;
import org.example.fashionstoresystem.entity.enums.OrderStatus;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    // Đặt hàng
    PlaceOrderResponseDTO placeOrder(PlaceOrderRequestDTO dto);

    // Theo dõi trạng thái đơn hàng - Xem danh sách đơn hàng
    Page<OrderSummaryResponseDTO> getMyOrders(Long userId, List<OrderStatus> statuses, Pageable pageable);

    // Dùng cho giao diện cá nhân: Liệt kê chi tiết từng món đồ (OrderItem) của User
    Page<OrderItemSummaryDTO> getMyOrderItems(Long userId, List<OrderStatus> statuses, Boolean reviewed,
            Pageable pageable);

    // Theo dõi trạng thái đơn hàng - Xem chi tiết đơn hàng
    OrderDetailResponseDTO getMyOrderDetail(Long userId, Long orderId);

    // Hủy đơn hàng
    MessageResponseDTO cancelOrder(Long userId, Long orderId, CancelOrderRequestDTO dto);

    // Thanh toán lại cho đơn MOMO
    String retryPayment(Long userId, Long orderId);


    // Hoàn kho (dùng cho cleanup task)
    void revertInventory(Long orderId);

    // DASHBOARD: Lấy thông tin tóm tắt đơn hàng cho Dashboard người dùng
    OrderDashboardSummaryDTO getDashboardSummary(Long userId);
}
