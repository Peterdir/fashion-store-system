package org.example.fashionstoresystem.service.coupon;

import org.example.fashionstoresystem.dto.request.ApplyCouponRequestDTO;
import org.example.fashionstoresystem.dto.request.CollectCouponRequestDTO;
import org.example.fashionstoresystem.dto.request.CreateCouponRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateCouponRequestDTO;
import org.example.fashionstoresystem.dto.response.ApplyCouponResponseDTO;
import org.example.fashionstoresystem.dto.response.CouponResponseDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;

import java.util.List;

public interface CouponService {
    // Xem danh sách mã giảm giá đang có
    List<CouponResponseDTO> getAvailableCoupons(Long userId);

    // Thu thập mã giảm giá
    MessageResponseDTO collectCoupon(Long userId, CollectCouponRequestDTO dto);

    // Áp dụng mã giảm giá cho đơn hàng
    ApplyCouponResponseDTO applyCoupon(Long userId, ApplyCouponRequestDTO dto, Double currentTotal);

    // Admin
    List<CouponResponseDTO> getAllCoupons();

    CouponResponseDTO getCouponDetail(Long couponId);

    CouponResponseDTO createCoupon(CreateCouponRequestDTO dto);

    CouponResponseDTO updateCoupon(Long couponId, UpdateCouponRequestDTO dto);

    MessageResponseDTO toggleCouponStatus(Long couponId);
}
