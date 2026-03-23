package org.example.fashionstoresystem.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.DiscountType;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCouponRequestDTO {
    private String code;
    private Double discountValue;
    private DiscountType discountType;
    private Instant startDate;
    private Instant expiryDate;
    private Double minOrderAmount;
    private Integer usageLimit;
    private boolean active;
}
