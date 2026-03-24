package org.example.fashionstoresystem.service.order;

import org.example.fashionstoresystem.dto.request.CancelOrderRequestDTO;
import org.example.fashionstoresystem.dto.request.PlaceOrderRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderSummaryResponseDTO;
import org.example.fashionstoresystem.dto.response.PlaceOrderResponseDTO;

import java.util.List;

public interface OrderService {
    // Đặt hàng
    PlaceOrderResponseDTO placeOrder(PlaceOrderRequestDTO dto);

    // Theo dõi trạng thái đơn hàng - Xem danh sách đơn hàng
    List<OrderSummaryResponseDTO> getMyOrders(Long userId);

    // Theo dõi trạng thái đơn hàng - Xem chi tiết đơn hàng
    OrderDetailResponseDTO getMyOrderDetail(Long userId, Long orderId);

    // Hủy đơn hàng
    MessageResponseDTO cancelOrder(Long userId, Long orderId, CancelOrderRequestDTO dto);
}
