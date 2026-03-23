package org.example.fashionstoresystem.service.return_request;

import org.example.fashionstoresystem.dto.request.SubmitReturnRequestDTO;
import org.example.fashionstoresystem.entity.jpa.Order;
import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.example.fashionstoresystem.entity.jpa.ReturnRequest;

import java.util.List;

public interface ReturnRequestService {
    List<Order> getOrdersByCustomer(Long customerId);
    Order getOrderForReturn(Long orderId);
    List<OrderItem> validateReturnEligibility(Long orderId, List<Long> itemIds);
    ReturnRequest submitReturnRequest(SubmitReturnRequestDTO dto, List<String> images);
}
