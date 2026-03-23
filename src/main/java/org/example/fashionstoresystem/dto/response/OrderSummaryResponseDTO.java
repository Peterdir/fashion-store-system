package org.example.fashionstoresystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.enums.PaymentMethod;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderSummaryResponseDTO {
    private Long orderId;
    private Date orderDate;
    private Double totalAmount;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private int itemCount;
}
