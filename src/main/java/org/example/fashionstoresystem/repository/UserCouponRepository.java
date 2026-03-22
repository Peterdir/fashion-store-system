package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {
}
