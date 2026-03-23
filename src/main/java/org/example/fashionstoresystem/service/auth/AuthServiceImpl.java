package org.example.fashionstoresystem.service.auth;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.RegisterRequestDTO;
import org.example.fashionstoresystem.dto.request.ResendVerificationEmailRequestDTO;
import org.example.fashionstoresystem.dto.request.VerifyEmailRequestDTO;
import org.example.fashionstoresystem.dto.response.RegisterResponseDTO;
import org.example.fashionstoresystem.entity.enums.Role;
import org.example.fashionstoresystem.entity.enums.UserStatus;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.repository.UserRepository;
import org.example.fashionstoresystem.service.email_log.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public RegisterResponseDTO registerNewAccount(RegisterRequestDTO dto) {
        validateInfo(dto);

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        if (userRepository.existsByPhone(dto.getPhone())) {
            throw new RuntimeException("Số điện thoại đã được sử dụng!");
        }

        String encodedPassword = passwordEncoder.encode(dto.getPassword());

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setPassword(encodedPassword);
        user.setStatus(UserStatus.PENDING);
        user.setRole(Role.CUSTOMER);

        String token = createVerificationToken(user);

        user = userRepository.save(user);

        // Cập nhật theo EF7: Bắt lỗi khi gửi email để không rollback việc tạo user
        String message = "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.";
        try {
            emailService.sendVerificationEmail(user.getEmail(), token);
        } catch (Exception e) {
            message = "Đăng ký thành công nhưng hệ thống gặp lỗi khi gửi email xác thực. Vui lòng sử dụng tính năng 'Gửi lại mã' sau.";
        }

        return RegisterResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .status(user.getStatus())
                .message(message)
                .build();
    }

    @Override
    public Boolean verifyEmail(VerifyEmailRequestDTO dto) {
        Optional<User> optionalUser = userRepository.findByVerificationToken(dto.getToken());

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("Token xác thực không hợp lệ!");
        }

        User user = optionalUser.get();
        if (user.getVerificationTokenExpiryDate().isBefore(Instant.now())) {
            throw new RuntimeException("Token xác thực đã hết hạn!");
        }

        user.setStatus(UserStatus.ACTIVE);
        user.setVerificationToken(null); // Clear token sau khi verify thành công
        user.setVerificationTokenExpiryDate(null);
        userRepository.save(user);

        return true;
    }

    @Override
    public Boolean resendVerificationEmail(ResendVerificationEmailRequestDTO dto) {
        Optional<User> optionalUser = userRepository.findByEmail(dto.getEmail());

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("Không tìm thấy người dùng!");
        }

        User user = optionalUser.get();
        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new RuntimeException("Tài khoản đã được xác thực trước đó!");
        }

        String newToken = createVerificationToken(user);
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), newToken);

        return true;
    }

    private void validateInfo(RegisterRequestDTO dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp!");
        }
    }

    private String createVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        // Hết hạn trong 24 giờ tới
        user.setVerificationTokenExpiryDate(Instant.now().plus(24, ChronoUnit.HOURS));
        return token;
    }
}
