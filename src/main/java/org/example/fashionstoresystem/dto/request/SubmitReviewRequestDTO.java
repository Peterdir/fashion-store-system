package org.example.fashionstoresystem.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitReviewRequestDTO {
    @NotNull(message = "ID sản phẩm không được để trống")
    private Long productId;

    @Min(value = 1, message = "Đánh giá thấp nhất là 1 sao")
    @Max(value = 5, message = "Đánh giá cao nhất là 5 sao")
    private int rating;

    @NotBlank(message = "Nội dung đánh giá không được để trống")
    @Size(max = 1000, message = "Nội dung đánh giá không được vượt quá 1000 ký tự")
    private String comment;
}
