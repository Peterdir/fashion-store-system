package org.example.fashionstoresystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.CreateCouponRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateCouponRequestDTO;
import org.example.fashionstoresystem.dto.response.CouponResponseDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.service.coupon.CouponService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CouponService couponService;

    // XEM TẤT CẢ MÃ
    @GetMapping
    public ResponseEntity<Page<CouponResponseDTO>> getAllCoupons(Pageable pageable) {
        return ResponseEntity.ok(couponService.getAllCoupons(pageable));
    }

    // XEM CHI TIẾT MÃ
    @GetMapping("/{couponId}")
    public ResponseEntity<CouponResponseDTO> getCouponDetail(
            @PathVariable Long couponId
    ) {
        return ResponseEntity.ok(couponService.getCouponDetail(couponId));
    }

    // TẠO MÃ GIẢM GIÁ
    @PostMapping
    public ResponseEntity<CouponResponseDTO> createCoupon(
            @RequestBody CreateCouponRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(couponService.createCoupon(dto));
    }

    // CẬP NHẬT MÃ
    @PutMapping("/{couponId}")
    public ResponseEntity<CouponResponseDTO> updateCoupon(
            @PathVariable Long couponId,
            @RequestBody UpdateCouponRequestDTO dto
    ) {
        return ResponseEntity.ok(couponService.updateCoupon(couponId, dto));
    }

    // BẬT/TẮT MÃ
    @PatchMapping("/{couponId}/toggle-status")
    public ResponseEntity<MessageResponseDTO> toggleCouponStatus(
            @PathVariable Long couponId
    ) {
        return ResponseEntity.ok(couponService.toggleCouponStatus(couponId));
    }
}
