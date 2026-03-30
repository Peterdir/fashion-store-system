package org.example.fashionstoresystem.controller.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.TwoFactorSetupRequestDTO;
import org.example.fashionstoresystem.dto.request.VerifyOtpRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.TwoFactorStatusResponseDTO;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.exception.UnauthenticatedException;
import org.example.fashionstoresystem.service.otp.OtpService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    // LẤY TRẠNG THÁI 2FA HIỆN TẠI
    @GetMapping("/status")
    public ResponseEntity<TwoFactorStatusResponseDTO> getTwoFactorStatus() {
        Long userId = getAuthenticatedUserId();
        TwoFactorStatusResponseDTO response = otpService.getTwoFactorStatus(userId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // THIẾT LẬP 2FA (BẬT/TẮT - GỬI MÃ NẾU LÀ BẬT)
    @PutMapping("/setup")
    public ResponseEntity<MessageResponseDTO> setupTwoFactor(
            @Valid @RequestBody TwoFactorSetupRequestDTO dto) {
        Long userId = getAuthenticatedUserId();
        MessageResponseDTO response = otpService.setupTwoFactor(userId, dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // XÁC MINH OTP ĐỂ KÍCH HOẠT 2FA
    @PostMapping("/verify")
    public ResponseEntity<TwoFactorStatusResponseDTO> verifyOtp(
            @Valid @RequestBody VerifyOtpRequestDTO dto) {
        Long userId = getAuthenticatedUserId();
        TwoFactorStatusResponseDTO response = otpService.verifyOtp(userId, dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // TRÍCH XUẤT userId TỪ SECURITY CONTEXT
    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new UnauthenticatedException("Vui lòng đăng nhập để thực hiện chức năng này!");
        }
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}
