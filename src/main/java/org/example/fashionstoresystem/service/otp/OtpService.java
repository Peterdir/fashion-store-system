package org.example.fashionstoresystem.service.otp;

import org.example.fashionstoresystem.dto.request.TwoFactorSetupRequestDTO;
import org.example.fashionstoresystem.dto.request.VerifyOtpRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.TwoFactorStatusResponseDTO;

public interface OtpService {
    // Xem trạng thái xác thực 2 bước hiện tại
    TwoFactorStatusResponseDTO getTwoFactorStatus(Long userId);

    // Bật/Tắt xác thực 2 bước (gửi OTP để xác nhận khi BẬT)
    MessageResponseDTO setupTwoFactor(Long userId, TwoFactorSetupRequestDTO dto);

    // Xác minh mã OTP để hoàn tất kích hoạt
    TwoFactorStatusResponseDTO verifyOtp(Long userId, VerifyOtpRequestDTO dto);
}
