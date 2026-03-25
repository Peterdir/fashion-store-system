package org.example.fashionstoresystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.SubmitReviewRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.service.review.ReviewService;
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
            @RequestParam Long userId,
            @RequestBody SubmitReviewRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.submitReview(userId, dto));
    }
}
