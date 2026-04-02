package org.example.fashionstoresystem.controller.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.CancelOrderRequestDTO;
import org.example.fashionstoresystem.dto.request.PlaceOrderRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderDashboardSummaryDTO;
import org.example.fashionstoresystem.dto.response.OrderDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderSummaryResponseDTO;
import org.example.fashionstoresystem.dto.response.PlaceOrderResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderItemSummaryDTO;
import org.example.fashionstoresystem.service.order.OrderService;
import org.example.fashionstoresystem.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.example.fashionstoresystem.entity.enums.OrderStatus;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ĐẶT HÀNG
    @PostMapping
    public ResponseEntity<PlaceOrderResponseDTO> placeOrder(
            @Valid @RequestBody PlaceOrderRequestDTO dto) {
        // Luôn ghi đè userId từ session để đảm bảo bảo mật
        dto.setUserId(SecurityUtils.getAuthenticatedUserId());
        PlaceOrderResponseDTO response = orderService.placeOrder(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // LẤY DANH SÁCH ĐƠN HÀNG (DẠNG GỘP ORDER) - DÙNG CHO TAB ALL
    @GetMapping
    public ResponseEntity<Page<OrderSummaryResponseDTO>> getMyOrders(
            @RequestParam(required = false) List<OrderStatus> statuses,
            Pageable pageable) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        Page<OrderSummaryResponseDTO> response = orderService.getMyOrders(userId, statuses, pageable);
        return ResponseEntity.ok(response);
    }

    // LẤY DANH SÁCH SẢN PHẨM TRONG ĐƠN (ORDER ITEM) - DÙNG CHO CÁC TAB TRẠNG THÁI
    @GetMapping("/items")
    public ResponseEntity<Page<OrderItemSummaryDTO>> getMyOrderItems(
            @RequestParam(required = false) List<OrderStatus> statuses,
            @RequestParam(required = false) Boolean reviewed,
            Pageable pageable) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        Page<OrderItemSummaryDTO> response = orderService.getMyOrderItems(userId, statuses, reviewed, pageable);
        return ResponseEntity.ok(response);
    }

    // XEM CHI TIẾT ĐƠN HÀNG
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponseDTO> getMyOrderDetail(
            @PathVariable Long orderId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        OrderDetailResponseDTO response = orderService.getMyOrderDetail(userId, orderId);
        return ResponseEntity.ok(response);
    }

    // HỦY ĐƠN HÀNG
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<MessageResponseDTO> cancelOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody CancelOrderRequestDTO dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        MessageResponseDTO response = orderService.cancelOrder(userId, orderId, dto);
        return ResponseEntity.ok(response);
    }

    // THANH TOÁN LẠI (Cho đơn hàng MoMo chưa quá hạn)
    @PostMapping("/{orderId}/retry-payment")
    public ResponseEntity<MessageResponseDTO> retryPayment(@PathVariable Long orderId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        String paymentUrl = orderService.retryPayment(userId, orderId);
        return ResponseEntity.ok(new MessageResponseDTO(paymentUrl));
    }

    // MUA LẠI ĐƠN HÀNG (Đưa vào giỏ hàng)
    @PostMapping("/{orderId}/repurchase")
    public ResponseEntity<MessageResponseDTO> repurchaseOrder(@PathVariable Long orderId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        orderService.repurchaseOrder(userId, orderId);
        return ResponseEntity.ok(new MessageResponseDTO("Đã thêm các sản phẩm vào giỏ hàng thành công!"));
    }

    // DASHBOARD SUMMARY
    @GetMapping("/dashboard-summary")
    public ResponseEntity<OrderDashboardSummaryDTO> getDashboardSummary() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(orderService.getDashboardSummary(userId));
    }
}
