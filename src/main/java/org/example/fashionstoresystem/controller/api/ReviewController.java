package org.example.fashionstoresystem.controller.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.SubmitReviewRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.ReviewResponseDTO;
import org.example.fashionstoresystem.service.review.ReviewService;
import org.example.fashionstoresystem.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // THÊM ĐÁNH GIÁ
    @PostMapping
    public ResponseEntity<MessageResponseDTO> submitReview(
            @Valid @RequestBody SubmitReviewRequestDTO dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.submitReview(userId, dto));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<ReviewResponseDTO>> getMyReviews(Pageable pageable) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(reviewService.getReviewsByUser(userId, pageable));
    }

    // XEM ĐÁNH GIÁ CỦA SẢN PHẨM
    @GetMapping("/products/{productId}")
    public ResponseEntity<Page<ReviewResponseDTO>> getReviewsByProduct(
            @PathVariable Long productId,
            Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId, pageable));
    }
}
