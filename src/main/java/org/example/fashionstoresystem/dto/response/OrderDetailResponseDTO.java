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
    private PaymentMethod paymentMethod;
    private String shippingAddress;
    private List<OrderItemDTO> items;

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
        private OrderStatus status;
        private RefundStatus refundStatus;
        private String cancellationReason;
        private List<OrderHistoryDTO> histories;
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
