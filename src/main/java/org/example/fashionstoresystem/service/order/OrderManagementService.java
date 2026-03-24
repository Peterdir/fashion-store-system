package org.example.fashionstoresystem.service.order;

import org.example.fashionstoresystem.entity.enums.OrderStatus;

public interface OrderManagementService {
    // Cập nhật trạng thái của một sản phẩm trong đơn hàng (dành cho Admin)
    void updateOrderItemStatus(Long orderItemId, OrderStatus newStatus);
}
