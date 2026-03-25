package org.example.fashionstoresystem.service.review;

import org.example.fashionstoresystem.dto.request.SubmitReviewRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.ReviewResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    // Lấy đánh giá của một sản phẩm
    Page<ReviewResponseDTO> getReviewsByProduct(Long productId, Pageable pageable);

    // Admin
    Page<ReviewResponseDTO> getAllReviews(Pageable pageable);

    // Đánh giá sản phẩm
    MessageResponseDTO submitReview(Long userId, SubmitReviewRequestDTO dto);
}
