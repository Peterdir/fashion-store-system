package org.example.fashionstoresystem.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.enums.PaymentMethod;
import org.example.fashionstoresystem.entity.enums.RefundStatus;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemSummaryDTO {
    private Long orderItemId;
    private Long orderId; // Để link bấm về Chi tiết Hóa đơn gốc
    private Long productId;
    private Date orderDate; // Ngày đặt hàng
    private PaymentMethod paymentMethod; // Hình thức thanh toán
    private String productName;
    private String productImage; // Đường dẫn ảnh đại diện (nếu có, không bắt buộc)
    private String size;
    private String color;
    private Long quantity;
    private Double price;
    private Double itemTotalAmount; // quantity * price
    private Double orderTotalAmount;
    private OrderStatus status; // Trạng thái tiến độ duy nhất của Item này
    private RefundStatus refundStatus;
    private String cancellationReason;
    @JsonProperty("isReviewed")
    private boolean isReviewed;
}
