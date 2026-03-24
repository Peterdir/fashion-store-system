package org.example.fashionstoresystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.PaymentMethod;

import java.util.Date;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderSummaryResponseDTO {
    private Long orderId;
    private Date orderDate;
    private Double totalAmount;
    private PaymentMethod paymentMethod;
    private int itemCount;
    // Tổng hợp trạng thái của từng sản phẩm: VD {"PAID": 2, "SHIPPING": 1}
    private Map<String, Integer> statusSummary;
}
