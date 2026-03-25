package org.example.fashionstoresystem.service.review;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.SubmitReviewRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.ReviewResponseDTO;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.jpa.Product;
import org.example.fashionstoresystem.entity.jpa.Review;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.repository.OrderItemRepository;
import org.example.fashionstoresystem.repository.ProductRepository;
import org.example.fashionstoresystem.repository.ReviewRepository;
import org.example.fashionstoresystem.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional
    public MessageResponseDTO submitReview(Long userId, SubmitReviewRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

        // Kiểm tra khách hàng đã mua sản phẩm và OrderItem đã ở trạng thái hoàn tất
        boolean hasPurchased =
                orderItemRepository.existsByOrderUserIdAndStatusAndProductVariantProductId(
                        userId, OrderStatus.DELIVERED, dto.getProductId()) ||
                orderItemRepository.existsByOrderUserIdAndStatusAndProductVariantProductId(
                        userId, OrderStatus.COMPLETED, dto.getProductId());

        if (!hasPurchased) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sản phẩm đã mua và đã giao thành công!");
        }

        // Validate rating
        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new RuntimeException("Điểm đánh giá phải từ 1 đến 5!");
        }

//        if (dto.getComment() == null || dto.getComment().isBlank()) {
//            throw new RuntimeException("Nội dung nhận xét không được để trống!");
//        }

        // Lưu đánh giá
        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .createdAt(Instant.now())
                .build();
        reviewRepository.save(review);

        return MessageResponseDTO.builder()
                .message("Gửi đánh giá thành công! Cảm ơn bạn đã đánh giá sản phẩm.")
                .build();
    }

    @Override
    public Page<ReviewResponseDTO> getReviewsByProduct(Long productId, Pageable pageable) {
        return reviewRepository.findByProductId(productId, pageable).map(this::mapToDTO);
    }
    
    @Override
    public Page<ReviewResponseDTO> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(this::mapToDTO);
    }
    
    private ReviewResponseDTO mapToDTO(Review review) {
        return ReviewResponseDTO.builder()
                .reviewId(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .userId(review.getUser().getId())
                .customerName(review.getUser().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
