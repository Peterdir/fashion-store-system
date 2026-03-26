package org.example.fashionstoresystem.service.order;

import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderSummaryResponseDTO;
import org.example.fashionstoresystem.entity.enums.OrderStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Date;

public interface OrderManagementService {
    // Cập nhật trạng thái của một sản phẩm trong đơn hàng (dành cho Admin)
    void updateOrderItemStatus(Long orderItemId, OrderStatus newStatus);

    Page<OrderSummaryResponseDTO> getAllOrders(OrderStatus status, Date startDate, Date endDate, Pageable pageable);

    OrderDetailResponseDTO getOrderDetail(Long orderId);

    MessageResponseDTO updateOrderStatus(Long orderId, OrderStatus status);
}
