package org.example.fashionstoresystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.DiscountType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyCouponResponseDTO {
    private String couponCode;
    private Double discountValue;
    private DiscountType discountType;
    private Double newTotalAmount;
    private String message;
}
