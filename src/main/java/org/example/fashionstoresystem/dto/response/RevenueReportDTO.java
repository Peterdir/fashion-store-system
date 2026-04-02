package org.example.fashionstoresystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.OrderType;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportDTO {
    private Double onlineRevenue;
    private Double offlineRevenue;
    private int totalOrders;
    private List<OrderSummaryDTO> orders;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderSummaryDTO {
        private Long orderId;
        private Double totalAmount;
        private OrderType type;
        private String orderDate;
        private Double discountAmount;
        private String couponCode;
        private List<OrderItemDTO> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDTO {
        private String productName;
        private Long quantity;
        private Double price;
    }
}
