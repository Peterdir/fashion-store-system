package org.example.fashionstoresystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentlyViewedResponseDTO {
    private Long id;
    private String productName;
    private Double productPrice;
    private Double originalPrice;
    private Integer discountPercent;
    private String brandName;
    private String imageUrl;
    private boolean inStock;
}
