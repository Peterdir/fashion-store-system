package org.example.fashionstoresystem.service.payment;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.ProcessPaymentRequestDTO;
import org.example.fashionstoresystem.dto.response.PaymentResponseDTO;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.jpa.Order;
import org.example.fashionstoresystem.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;

    @Override
    public Order getOrderDetails(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));
    }

    @Override
    public PaymentResponseDTO processPayment(ProcessPaymentRequestDTO dto) {
        Order order = getOrderDetails(dto.getOrderId());
        
        // 1. Kiểm tra hết hạn 10 phút (Theo logic SD12)
        Instant orderTime = order.getOrderDate().toInstant();
        if (orderTime.plus(10, ChronoUnit.MINUTES).isBefore(Instant.now())) {
            order.setStatus(OrderStatus.PAYMENT_EXPIRED);
            orderRepository.save(order);
            return PaymentResponseDTO.builder()
                    .status("PAYMENT_TIMEOUT")
                    .message("Phiên thanh toán đã hết hạn (quá 10 phút)!")
                    .build();
        }
        
        // 2. Gọi API Payment Gateway VNPay/Momo ở đây...
        
        // Giả lập thanh toán luôn thành công (Theo SD12: Success branch)
        boolean paymentSuccess = true;
        
        if (paymentSuccess) {
            order.setStatus(OrderStatus.PAID);
            // Cập nhật phương thức thanh toán khách đã chọn (nếu có trong dto)
            if (dto.getPaymentMethod() != null) {
                order.setPaymentMethod(dto.getPaymentMethod());
            }
            orderRepository.save(order);
            
            return PaymentResponseDTO.builder()
                    .status("SUCCESS")
                    .transactionId("TXN_FAKEMOCK_" + System.currentTimeMillis())
                    .message("Thanh toán thành công!")
                    .build();
        } else {
            // Nhánh Payment Failed
            order.setStatus(OrderStatus.PAYMENT_FAILED);
            orderRepository.save(order);
            
            return PaymentResponseDTO.builder()
                    .status("FAILED")
                    .message("Thanh toán thất bại từ phía ngân hàng!")
                    .build();
        }
    }
}
