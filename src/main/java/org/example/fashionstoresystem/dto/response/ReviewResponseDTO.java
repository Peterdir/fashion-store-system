package org.example.fashionstoresystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponseDTO {
    private Long reviewId;
    private Long productId;
    private String productName;
    private String productImage;
    private Long userId;
    private String customerName;
    private Integer rating;
    private String comment;
    private Double price;
    private Date orderDate;
    private Instant createdAt;
}
