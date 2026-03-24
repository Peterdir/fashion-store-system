package org.example.fashionstoresystem.service.user;

import org.example.fashionstoresystem.dto.request.*;
import org.example.fashionstoresystem.dto.response.*;

import java.util.List;

public interface UserService {
    // Quản lý thông tin cá nhân
    ProfileResponseDTO getProfile(Long userId);
    ProfileResponseDTO updateProfile(Long userId, UpdateProfileRequestDTO dto);

    // Đổi mật khẩu
    MessageResponseDTO changePassword(Long userId, ChangePasswordRequestDTO dto);

    // Admin
    List<CustomerSummaryResponseDTO> getAllCustomers(String keyword);

    CustomerDetailResponseDTO getCustomerDetail(Long customerId);

    MessageResponseDTO updateCustomerStatus(Long customerId, UpdateCustomerStatusRequestDTO dto);
}
