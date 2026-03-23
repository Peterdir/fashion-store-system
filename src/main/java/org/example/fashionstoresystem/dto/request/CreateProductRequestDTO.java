package org.example.fashionstoresystem.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductRequestDTO {
    private String name;
    private String category;
    private Double price;
    private String description;
    private List<String> imageUrls;
    private List<ProductVariantRequestDTO> variants;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductVariantRequestDTO {
        private String size;
        private String color;
        private Long stockQuantity;
    }
}
