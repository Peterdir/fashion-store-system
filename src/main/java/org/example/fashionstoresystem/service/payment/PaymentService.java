package org.example.fashionstoresystem.service.payment;

import org.example.fashionstoresystem.dto.request.ProcessPaymentRequestDTO;
import org.example.fashionstoresystem.dto.response.PaymentResponseDTO;
import org.example.fashionstoresystem.entity.jpa.Order;

import java.util.Map;

public interface PaymentService {
    Order getOrderDetails(Long orderId);
    PaymentResponseDTO processPayment(ProcessPaymentRequestDTO dto);
    
    // Xử lý MoMo
    void processMomoIPN(Map<String, Object> payload);
    String processMomoReturn(Map<String, String> allParams);
}
