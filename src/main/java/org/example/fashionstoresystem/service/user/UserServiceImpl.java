package org.example.fashionstoresystem.service.user;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.ChangePasswordRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateProfileRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.ProfileResponseDTO;
import org.example.fashionstoresystem.dto.request.UpdateCustomerStatusRequestDTO;
import org.example.fashionstoresystem.dto.response.CustomerSummaryResponseDTO;
import org.example.fashionstoresystem.dto.response.CustomerDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderSummaryResponseDTO;
import org.example.fashionstoresystem.entity.enums.Role;
import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // QUẢN LÝ THÔNG TIN CÁ NHÂN

    @Override
    public ProfileResponseDTO getProfile(Long userId) {
        User user = findUserById(userId);

        return ProfileResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .address(user.getAddress())
                .role(user.getRole())
                .build();
    }

    @Override
    @Transactional
    public ProfileResponseDTO updateProfile(Long userId, UpdateProfileRequestDTO dto) {
        User user = findUserById(userId);

        // Dữ liệu không hợp lệ - Kiểm tra trùng lặp phone với user khác
        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            if (userRepository.existsByPhoneAndIdNot(dto.getPhone(), userId)) {
                throw new RuntimeException("Số điện thoại đã được sử dụng bởi tài khoản khác!");
            }
            user.setPhone(dto.getPhone());
        }

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(dto.getFullName());
        }

        if (dto.getAddress() != null) {
            user.setAddress(dto.getAddress());
        }

        user = userRepository.save(user);

        return ProfileResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .address(user.getAddress())
                .role(user.getRole())
                .build();
    }

    // ĐỔI MẬT KHẨU

    @Override
    @Transactional
    public MessageResponseDTO changePassword(Long userId, ChangePasswordRequestDTO dto) {
        User user = findUserById(userId);

        // Mật khẩu hiện tại không đúng
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng!");
        }

        // Mật khẩu mới không hợp lệ
        if (dto.getNewPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmNewPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp!");
        }

        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        return MessageResponseDTO.builder()
                .message("Đổi mật khẩu thành công!")
                .build();
    }

    // CUSTOMER MANAGEMENT (ADMIN)

    @Override
    public List<CustomerSummaryResponseDTO> getAllCustomers(String keyword) {
        List<User> customers;
        if (keyword == null || keyword.trim().isEmpty()) {
            customers = userRepository.findByRole(Role.CUSTOMER);
        } else {
            customers = userRepository.findByRole(Role.CUSTOMER).stream()
                    .filter(u -> u.getFullName().toLowerCase().contains(keyword.toLowerCase())
                            || u.getEmail().toLowerCase().contains(keyword.toLowerCase())
                            || u.getPhone().contains(keyword))
                    .collect(Collectors.toList());
        }

        return customers.stream().map(u -> CustomerSummaryResponseDTO.builder()
                .userId(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .status(u.getStatus())
                .build()).collect(Collectors.toList());
    }

    @Override
    public CustomerDetailResponseDTO getCustomerDetail(Long customerId) {
        User user = findUserById(customerId);
        if (user.getRole() != Role.CUSTOMER) {
            throw new RuntimeException("Tài khoản không phải là khách hàng!");
        }

        List<OrderSummaryResponseDTO> orderHistory = user.getOrders().stream().map(o -> {
            Map<String, Integer> statusSummary = new HashMap<>();
            for (OrderItem item : o.getOrderItems()) {
                String statusStr = item.getStatus().name();
                statusSummary.put(statusStr, statusSummary.getOrDefault(statusStr, 0) + 1);
            }

            return OrderSummaryResponseDTO.builder()
                    .orderId(o.getId())
                    .orderDate(o.getOrderDate())
                    .totalAmount(o.getTotalAmount())
                    .paymentMethod(o.getPaymentMethod())
                    .itemCount(o.getOrderItems().size())
                    .statusSummary(statusSummary)
                    .build();
        }).collect(Collectors.toList());

        return CustomerDetailResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .status(user.getStatus())
                .orderHistory(orderHistory)
                .build();
    }

    @Override
    @Transactional
    public MessageResponseDTO updateCustomerStatus(Long customerId, UpdateCustomerStatusRequestDTO dto) {
        User user = findUserById(customerId);
        if (user.getRole() != Role.CUSTOMER) {
            throw new RuntimeException("Chỉ có thể cập nhật trạng thái của khách hàng!");
        }
        if (dto.getStatus() == null) {
            throw new RuntimeException("Trạng thái không hợp lệ!");
        }

        user.setStatus(dto.getStatus());
        userRepository.save(user);

        return MessageResponseDTO.builder()
                .message("Cập nhật trạng thái khách hàng thành công!")
                .build();
    }

    // PRIVATE HELPERS

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
    }
}
