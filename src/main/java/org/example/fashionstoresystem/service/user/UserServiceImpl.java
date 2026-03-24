package org.example.fashionstoresystem.service.user;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.ChangePasswordRequestDTO;
import org.example.fashionstoresystem.dto.request.TwoFactorSetupRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateProfileRequestDTO;
import org.example.fashionstoresystem.dto.request.VerifyOtpRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.ProfileResponseDTO;
import org.example.fashionstoresystem.dto.response.TwoFactorStatusResponseDTO;
import org.example.fashionstoresystem.entity.jpa.Otp;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.repository.OtpRepository;
import org.example.fashionstoresystem.repository.UserRepository;
import org.example.fashionstoresystem.service.email_log.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpRepository otpRepository;
    private final EmailService emailService;

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

    // XÁC THỰC HAI BƯỚC

    @Override
    public TwoFactorStatusResponseDTO getTwoFactorStatus(Long userId) {
        User user = findUserById(userId);

        return TwoFactorStatusResponseDTO.builder()
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .message(user.isTwoFactorEnabled()
                        ? "Xác thực hai bước đang được bật."
                        : "Xác thực hai bước đang tắt.")
                .build();
    }

    @Override
    @Transactional
    public MessageResponseDTO requestTwoFactorSetup(Long userId, TwoFactorSetupRequestDTO dto) {
        User user = findUserById(userId);

        // Khách hàng tắt xác thực 2 bước
        if (!dto.isEnable()) {
            user.setTwoFactorEnabled(false);
            userRepository.save(user);
            return MessageResponseDTO.builder()
                    .message("Đã tắt xác thực hai bước.")
                    .build();
        }

        // Tạo mã OTP và gửi qua email
        String otpCode = generateOtpCode();

        // Xóa OTP cũ trước khi tạo mới
        otpRepository.deleteByUserEmail(user.getEmail());

        Otp otp = Otp.builder()
                .user(user)
                .code(otpCode)
                .expiryTime(Instant.now().plus(5, ChronoUnit.MINUTES))
                .used(false)
                .build();
        otpRepository.save(otp);

        // Gửi OTP qua email
        try {
            emailService.sendVerificationEmail(user.getEmail(), "Mã xác thực 2 bước của bạn là: " + otpCode);
        } catch (Exception e) {
            // Không gửi được mã xác thực
            throw new RuntimeException("Hệ thống không thể gửi mã xác thực! Vui lòng thử lại sau.");
        }

        return MessageResponseDTO.builder()
                .message("Mã OTP đã được gửi đến email " + user.getEmail())
                .build();
    }

    @Override
    @Transactional
    public TwoFactorStatusResponseDTO verifyTwoFactorOtp(Long userId, VerifyOtpRequestDTO dto) {
        User user = findUserById(userId);

        // Mã xác thực không hợp lệ
        Otp otp = otpRepository.findByUserEmailAndCode(user.getEmail(), dto.getOtpCode())
                .orElseThrow(() -> new RuntimeException("Mã xác thực không hợp lệ!"));

        if (otp.isUsed()) {
            throw new RuntimeException("Mã xác thực đã được sử dụng!");
        }

        if (otp.getExpiryTime().isBefore(Instant.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn!");
        }

        // Kích hoạt 2FA
        otp.setUsed(true);
        otpRepository.save(otp);

        user.setTwoFactorEnabled(true);
        userRepository.save(user);

        return TwoFactorStatusResponseDTO.builder()
                .twoFactorEnabled(true)
                .message("Xác thực hai bước đã được kích hoạt thành công!")
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

    // PRIVATE HELPERS

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
    }

    private String generateOtpCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }
}
