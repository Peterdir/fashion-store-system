package org.example.fashionstoresystem.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.ProductStatus;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProductRequestDTO {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(min = 2, max = 255, message = "Tên sản phẩm phải từ 2-255 ký tự")
    private String name;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @NotNull(message = "Giá không được để trống")
    @Positive(message = "Giá phải lớn hơn 0")
    private Double price;

    @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
    private String description;

    @NotNull(message = "Trạng thái không được để trống")
    private ProductStatus status;

    @NotEmpty(message = "Phải có ít nhất một ảnh sản phẩm")
    @Size(min = 1, max = 10, message = "Số lượng ảnh từ 1-10")
    private List<String> imageUrls;

    @NotEmpty(message = "Phải có ít nhất một biến thể sản phẩm (variant)")
    @Valid
    private List<ProductVariantRequestDTO> variants;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductVariantRequestDTO {
        private Long variantId; // Null if new variant

        @NotBlank(message = "Kích thước không được để trống")
        @Size(max = 20, message = "Kích thước tối đa 20 ký tự")
        private String size;

        @NotBlank(message = "Màu sắc không được để trống")
        @Size(max = 50, message = "Màu sắc tối đa 50 ký tự")
        private String color;

        @NotNull(message = "Số lượng tồn kho không được để trống")
        @PositiveOrZero(message = "Số lượng tồn kho không được âm")
        private Long stockQuantity;
    }
}
