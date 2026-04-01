package org.example.fashionstoresystem.controller.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.ApplyCouponRequestDTO;
import org.example.fashionstoresystem.dto.request.CollectCouponRequestDTO;
import org.example.fashionstoresystem.dto.response.ApplyCouponResponseDTO;
import org.example.fashionstoresystem.dto.response.CouponResponseDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.service.coupon.CouponService;
import org.example.fashionstoresystem.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    // XEM DANH SÁCH MÃ
    @GetMapping
    public ResponseEntity<List<CouponResponseDTO>> getAvailableCoupons() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(couponService.getAvailableCoupons(userId));
    }

    // THU THẬP MÃ GIẢM GIÁ
    @PostMapping("/collect")
    public ResponseEntity<MessageResponseDTO> collectCoupon(
            @Valid @RequestBody CollectCouponRequestDTO dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(couponService.collectCoupon(userId, dto));
    }

    // ÁP DỤNG MÃ CHO ĐƠN HÀNG
    @PostMapping("/apply")
    public ResponseEntity<ApplyCouponResponseDTO> applyCoupon(
            @RequestParam Double currentTotal,
            @Valid @RequestBody ApplyCouponRequestDTO dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.OK)
                .body(couponService.applyCoupon(userId, dto, currentTotal));
    }
}
