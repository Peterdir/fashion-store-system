package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
}
