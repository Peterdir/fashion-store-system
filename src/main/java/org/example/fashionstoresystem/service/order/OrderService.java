package org.example.fashionstoresystem.service.order;

import org.example.fashionstoresystem.dto.request.PlaceOrderRequestDTO;
import org.example.fashionstoresystem.dto.response.PlaceOrderResponseDTO;

public interface OrderService {
    PlaceOrderResponseDTO placeOrder(PlaceOrderRequestDTO dto);
}
