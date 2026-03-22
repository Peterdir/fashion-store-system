package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
}
