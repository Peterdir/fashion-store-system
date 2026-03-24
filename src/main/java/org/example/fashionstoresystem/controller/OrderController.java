package org.example.fashionstoresystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.CancelOrderRequestDTO;
import org.example.fashionstoresystem.dto.request.PlaceOrderRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderSummaryResponseDTO;
import org.example.fashionstoresystem.dto.response.PlaceOrderResponseDTO;
import org.example.fashionstoresystem.service.order.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ĐẶT HÀNG
    @PostMapping
    public ResponseEntity<PlaceOrderResponseDTO> placeOrder(
            @RequestBody PlaceOrderRequestDTO dto
    ) {
        PlaceOrderResponseDTO response = orderService.placeOrder(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // LẤY DANH SÁCH ĐƠN HÀNG
    @GetMapping
    public ResponseEntity<List<OrderSummaryResponseDTO>> getMyOrders(
            @RequestParam Long userId
    ) {
        List<OrderSummaryResponseDTO> response = orderService.getMyOrders(userId);
        return ResponseEntity.ok(response);
    }

    // XEM CHI TIẾT ĐƠN HÀNG
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponseDTO> getMyOrderDetail(
            @RequestParam Long userId,
            @PathVariable Long orderId
    ) {
        OrderDetailResponseDTO response = orderService.getMyOrderDetail(userId, orderId);
        return ResponseEntity.ok(response);
    }

    // HỦY ĐƠN HÀNG
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<MessageResponseDTO> cancelOrder(
            @RequestParam Long userId,
            @PathVariable Long orderId,
            @RequestBody CancelOrderRequestDTO dto
    ) {
        MessageResponseDTO response = orderService.cancelOrder(userId, orderId, dto);
        return ResponseEntity.ok(response);
    }
}
