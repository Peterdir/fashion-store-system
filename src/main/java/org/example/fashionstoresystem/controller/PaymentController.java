package org.example.fashionstoresystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.ProcessPaymentRequestDTO;
import org.example.fashionstoresystem.dto.response.PaymentResponseDTO;
import org.example.fashionstoresystem.service.payment.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // XỬ LÝ THANH TOÁN
    @PostMapping("/process")
    public ResponseEntity<PaymentResponseDTO> processPayment(
            @Valid @RequestBody ProcessPaymentRequestDTO dto
    ) {
        PaymentResponseDTO response = paymentService.processPayment(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
