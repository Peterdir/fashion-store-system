package org.example.fashionstoresystem.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.PaymentMethod;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessPaymentRequestDTO {
    private Long orderId;
    private PaymentMethod paymentMethod;
}
