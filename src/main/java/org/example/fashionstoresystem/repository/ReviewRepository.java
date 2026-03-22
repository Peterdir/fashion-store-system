package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // Hiển thị danh sách đánh giá của 1 sản phẩm
    List<Review> findByProductId(Long productId);
}
