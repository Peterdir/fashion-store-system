package org.example.fashionstoresystem.controller.api;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.service.payment.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * MoMo IPN (Instant Payment Notification)
     * Server-to-Server callback
     */
    @PostMapping("/momo/ipn")
    public ResponseEntity<?> momoIPN(@RequestBody Map<String, Object> payload) {
        try {
            paymentService.processMomoIPN(payload);
        } catch (Exception e) {
            // Log lỗi nhưng trả về No Content để MoMo không retry vô hạn nếu lỗi logic
            System.err.println("Lỗi IPN MoMo: " + e.getMessage());
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * MoMo Return URL
     * Redirect từ trình duyệt người dùng sau khi thanh toán
     */
    @GetMapping("/momo/return")
    public ResponseEntity<?> momoReturn(@RequestParam Map<String, String> allParams) {
        String status = paymentService.processMomoReturn(allParams);
        String orderId = allParams.get("orderId");

        // Redirect người dùng về trang thông báo trên Frontend
        String redirectUrl = "/personal-center?orderId=" + orderId + "&paymentStatus=" + status;
        
        return ResponseEntity.status(302).header("Location", redirectUrl).build();
    }
}
