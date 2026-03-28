package org.example.fashionstoresystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.ProductStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSummaryResponseDTO {
    private Long productId;
    private String name;
    private Double price;
    private String category;
    private ProductStatus status;
    private String primaryImageUrl;
    private String hoverImageUrl;
}
