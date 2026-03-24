package org.example.fashionstoresystem.service.user;

import org.example.fashionstoresystem.dto.request.*;
import org.example.fashionstoresystem.dto.response.*;

import java.util.List;

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

    // Admin
    List<CustomerSummaryResponseDTO> getAllCustomers(String keyword);

    CustomerDetailResponseDTO getCustomerDetail(Long customerId);

    MessageResponseDTO updateCustomerStatus(Long customerId, UpdateCustomerStatusRequestDTO dto);
}
