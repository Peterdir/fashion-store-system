package org.example.fashionstoresystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderSummaryResponseDTO;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.service.order.OrderManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderManagementService orderManagementService;

    // DANH SÁCH TẤT CẢ ĐƠN HÀNG
    @GetMapping
    public ResponseEntity<Page<OrderSummaryResponseDTO>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            Pageable pageable
    ) {
        return ResponseEntity.ok(orderManagementService.getAllOrders(status, startDate, endDate, pageable));
    }

    // XEM CHI TIẾT ĐƠN HÀNG
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponseDTO> getOrderDetail(
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(orderManagementService.getOrderDetail(orderId));
    }

    // CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<MessageResponseDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        return ResponseEntity.ok(orderManagementService.updateOrderStatus(orderId, status));
    }

    // CẬP NHẬT TRẠNG THÁI TỪNG SẢN PHẨM TRONG ĐƠN
    @PatchMapping("/items/{itemId}/status")
    public ResponseEntity<Void> updateOrderItemStatus(
            @PathVariable Long itemId,
            @RequestParam OrderStatus status
    ) {
        orderManagementService.updateOrderItemStatus(itemId, status);
        return ResponseEntity.noContent().build();
    }
}
