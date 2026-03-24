package org.example.fashionstoresystem.service.review;

import org.example.fashionstoresystem.dto.request.SubmitReviewRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;

public interface ReviewService {
    // Đánh giá sản phẩm
    MessageResponseDTO submitReview(Long userId, SubmitReviewRequestDTO dto);
}
