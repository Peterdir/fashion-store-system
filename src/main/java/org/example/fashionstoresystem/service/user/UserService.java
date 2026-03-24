package org.example.fashionstoresystem.service.user;

import org.example.fashionstoresystem.dto.request.ChangePasswordRequestDTO;
import org.example.fashionstoresystem.dto.request.TwoFactorSetupRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateProfileRequestDTO;
import org.example.fashionstoresystem.dto.request.VerifyOtpRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.ProfileResponseDTO;
import org.example.fashionstoresystem.dto.response.TwoFactorStatusResponseDTO;

public interface UserService {
    // Quản lý thông tin cá nhân
    ProfileResponseDTO getProfile(Long userId);
    ProfileResponseDTO updateProfile(Long userId, UpdateProfileRequestDTO dto);

    // Xác thực hai bước
    TwoFactorStatusResponseDTO getTwoFactorStatus(Long userId);
    MessageResponseDTO requestTwoFactorSetup(Long userId, TwoFactorSetupRequestDTO dto);
    TwoFactorStatusResponseDTO verifyTwoFactorOtp(Long userId, VerifyOtpRequestDTO dto);

    // Đổi mật khẩu
    MessageResponseDTO changePassword(Long userId, ChangePasswordRequestDTO dto);
}
