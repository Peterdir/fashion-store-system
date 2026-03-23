package org.example.fashionstoresystem.service.order;

import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.jpa.Order;

import java.util.List;

public interface OrderManagementService {
    List<Order> getAllOrders();
    Order getOrderDetails(Long id);
    void updateOrderStatus(Long id, OrderStatus newStatus);
}
