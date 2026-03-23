package org.example.fashionstoresystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.enums.PaymentMethod;
import org.example.fashionstoresystem.entity.enums.RefundStatus;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponseDTO {
    private Long orderId;
    private Date orderDate;
    private Double totalAmount;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String shippingAddress;
    private String cancellationReason;
    private RefundStatus refundStatus;
    private List<OrderItemDTO> items;
    private List<OrderHistoryDTO> histories;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDTO {
        private Long orderItemId;
        private String productName;
        private String size;
        private String color;
        private Long quantity;
        private Double price;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderHistoryDTO {
        private OrderStatus previousStatus;
        private OrderStatus newStatus;
        private Date changeDate;
    }
}
