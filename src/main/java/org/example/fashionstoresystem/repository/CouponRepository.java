package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    // In ra các Khuyến mãi đang mở trên trang chủ
    List<Coupon> findByActiveTrue();

    // Check mã khách nhập có tồn tại và đang mở không
    Optional<Coupon> findByCodeAndActiveTrue(String code);

    // Áp dụng mã: Mã đang hiệu lực VÀ chưa qua ngày hết hạn
    Optional<Coupon> findByCodeAndActiveTrueAndExpiryDateAfter(String code, Instant currentDate);
}
