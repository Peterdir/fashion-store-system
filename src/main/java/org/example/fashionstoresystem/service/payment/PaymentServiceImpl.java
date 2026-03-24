package org.example.fashionstoresystem.service.payment;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.ProcessPaymentRequestDTO;
import org.example.fashionstoresystem.dto.response.PaymentResponseDTO;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.jpa.Order;
import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.example.fashionstoresystem.repository.OrderItemRepository;
import org.example.fashionstoresystem.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public Order getOrderDetails(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));
    }

    @Override
    @Transactional
    public PaymentResponseDTO processPayment(ProcessPaymentRequestDTO dto) {
        Order order = getOrderDetails(dto.getOrderId());

        // 1. Kiểm tra hết hạn 10 phút
        Instant orderTime = order.getOrderDate().toInstant();
        if (orderTime.plus(10, ChronoUnit.MINUTES).isBefore(Instant.now())) {
            // Set tất cả item sang PAYMENT_EXPIRED
            for (OrderItem item : order.getOrderItems()) {
                if (item.getStatus() == OrderStatus.PENDING_PAYMENT) {
                    item.setStatus(OrderStatus.PAYMENT_EXPIRED);
                    orderItemRepository.save(item);
                }
            }
            return PaymentResponseDTO.builder()
                    .status("PAYMENT_TIMEOUT")
                    .message("Phiên thanh toán đã hết hạn (quá 10 phút)!")
                    .build();
        }

        // 2. Gọi API Payment Gateway VNPay/Momo ở đây...

        // Giả lập thanh toán luôn thành công
        boolean paymentSuccess = true;

        if (paymentSuccess) {
            // Set tất cả item sang PAID (cùng 1 phương thức thanh toán)
            for (OrderItem item : order.getOrderItems()) {
                if (item.getStatus() == OrderStatus.PENDING_PAYMENT ||
                        item.getStatus() == OrderStatus.PAYMENT_FAILED) {
                    item.setStatus(OrderStatus.PAID);
                    orderItemRepository.save(item);
                }
            }

            if (dto.getPaymentMethod() != null) {
                order.setPaymentMethod(dto.getPaymentMethod());
                orderRepository.save(order);
            }

            return PaymentResponseDTO.builder()
                    .status("SUCCESS")
                    .transactionId("TXN_FAKEMOCK_" + System.currentTimeMillis())
                    .message("Thanh toán thành công!")
                    .build();
        } else {
            // Set tất cả item sang PAYMENT_FAILED
            for (OrderItem item : order.getOrderItems()) {
                if (item.getStatus() == OrderStatus.PENDING_PAYMENT) {
                    item.setStatus(OrderStatus.PAYMENT_FAILED);
                    orderItemRepository.save(item);
                }
            }

            return PaymentResponseDTO.builder()
                    .status("FAILED")
                    .message("Thanh toán thất bại từ phía ngân hàng!")
                    .build();
        }
    }
}
