package org.example.fashionstoresystem.service.auth;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.*;
import org.example.fashionstoresystem.dto.response.LoginResponseDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.RegisterResponseDTO;
import org.example.fashionstoresystem.entity.enums.Role;
import org.example.fashionstoresystem.entity.enums.UserStatus;
import org.example.fashionstoresystem.entity.jpa.PasswordResetToken;
import org.example.fashionstoresystem.entity.jpa.RefreshToken;
import org.example.fashionstoresystem.entity.jpa.Token;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.repository.PasswordResetTokenRepository;
import org.example.fashionstoresystem.repository.RefreshTokenRepository;
import org.example.fashionstoresystem.repository.TokenRepository;
import org.example.fashionstoresystem.repository.UserRepository;
import org.example.fashionstoresystem.service.email_log.EmailService;
import org.example.fashionstoresystem.service.jwt.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final TokenRepository tokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    // ĐĂNG KÝ

    @Override
    public RegisterResponseDTO registerNewAccount(RegisterRequestDTO dto) {
        validateRegisterInfo(dto);

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        if (userRepository.existsByPhone(dto.getPhone())) {
            throw new RuntimeException("Số điện thoại đã được sử dụng!");
        }

        String encodedPassword = passwordEncoder.encode(dto.getPassword());

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setFullName(capitalizeName(dto.getFullName()));
        user.setPhone(dto.getPhone());
        user.setPassword(encodedPassword);
        user.setStatus(UserStatus.PENDING);
        user.setRole(Role.CUSTOMER);

        String token = createVerificationToken(user);

        user = userRepository.save(user);

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
    public Boolean verifyEmail(String token) {
        Optional<User> optionalUser = userRepository.findByVerificationToken(token);

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("Token xác thực không hợp lệ!");
        }

        User user = optionalUser.get();
        if (user.getVerificationTokenExpiryDate().isBefore(Instant.now())) {
            throw new RuntimeException("Token xác thực đã hết hạn!");
        }

        // Nếu đang trong quy trình đổi email (có pendingEmail)
        if (user.getPendingEmail() != null) {
            user.setEmail(user.getPendingEmail());
            user.setPendingEmail(null);
        }

        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiryDate(null);
        userRepository.save(user);

        return true;
    }

    @Override
    public MessageResponseDTO resendVerificationEmail(ResendVerificationEmailRequestDTO dto) {
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

        return MessageResponseDTO.builder()
                .message("Email xác thực đã được gửi lại thành công!")
                .build();
    }

    // ĐĂNG NHẬP

    @Override
    public LoginResponseDTO login(LoginRequestDTO dto) {
        // Thiếu thông tin đăng nhập
        if (dto.getEmail() == null || dto.getEmail().isBlank() ||
                dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new RuntimeException("Vui lòng nhập đầy đủ thông tin!");
        }

        // Tên đăng nhập không tồn tại
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Tên đăng nhập không tồn tại!"));

        // Mật khẩu không chính xác
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

        // Kiểm tra trạng thái tài khoản
        if (user.getStatus() == UserStatus.PENDING) {
            throw new RuntimeException("Tài khoản chưa được xác thực email!");
        }
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new RuntimeException("Tài khoản đã bị khóa!");
        }

        // Vô hiệu hóa các token cũ
        List<Token> validTokens = tokenRepository.findAllValidTokensByUser(user.getId());
        validTokens.forEach(t -> {
            t.setExpired(true);
            t.setRevoked(true);
        });
        tokenRepository.saveAll(validTokens);

        // Tạo JWT access token
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole().name());
        String accessToken = jwtService.generateAccessToken(extraClaims, user);

        // Tạo JWT refresh token
        String refreshToken = jwtService.generateRefreshToken(user);

        Token newToken = Token.builder()
                .user(user)
                .token(accessToken)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(newToken);

        // Lưu refresh token vào DB
        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiryDate(Instant.now().plus(7, ChronoUnit.DAYS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newRefreshToken);

        return LoginResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    // QUÊN MẬT KHẨU

    @Override
    @Transactional
    public MessageResponseDTO forgotPassword(ForgotPasswordRequestDTO dto) {
        // Email không tồn tại trong hệ thống
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại!"));

        // Tạo token khôi phục mật khẩu
        String resetToken = UUID.randomUUID().toString();

        PasswordResetToken passwordResetToken = PasswordResetToken.builder()
                .user(user)
                .token(resetToken)
                .expiryDate(new Date(System.currentTimeMillis() + 30 * 60 * 1000)) // 30 phút
                .used(false)
                .build();
        passwordResetTokenRepository.save(passwordResetToken);

        // Gửi email chứa liên kết khôi phục
        String resetLink = "http://localhost:8080/reset-password?token=" + resetToken;
        emailService.sendVerificationEmail(user.getEmail(), resetLink);

        return MessageResponseDTO.builder()
                .message("Liên kết khôi phục mật khẩu đã được gửi đến email của bạn.")
                .build();
    }

    @Override
    @Transactional
    public MessageResponseDTO resetPassword(ResetPasswordRequestDTO dto) {
        // Liên kết khôi phục không hợp lệ hoặc đã hết hạn
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(dto.getToken())
                .orElseThrow(() -> new RuntimeException("Token khôi phục không hợp lệ!"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Token khôi phục đã được sử dụng!");
        }

        if (resetToken.getExpiryDate().before(new Date())) {
            throw new RuntimeException("Token khôi phục đã hết hạn!");
        }

        // Mật khẩu mới không hợp lệ
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp!");
        }

        if (dto.getNewPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        // Cập nhật mật khẩu mới
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        // Đánh dấu token đã sử dụng
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return MessageResponseDTO.builder()
                .message("Đổi mật khẩu thành công!")
                .build();
    }

    // ĐĂNG XUẤT

    @Override
    public MessageResponseDTO logout(LogoutRequestDTO dto) {
        Token token = tokenRepository.findByToken(dto.getToken())
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ!"));

        token.setExpired(true);
        token.setRevoked(true);
        tokenRepository.save(token);

        return MessageResponseDTO.builder()
                .message("Đăng xuất thành công!")
                .build();
    }

    // LÀM MỚI TOKEN

    @Override
    @Transactional
    public LoginResponseDTO refreshToken(RefreshTokenRequestDTO dto) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(dto.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Refresh token không hợp lệ!"));

        if (refreshToken.isRevoked()) {
            throw new RuntimeException("Refresh token đã bị thu hồi!");
        }

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            throw new RuntimeException("Refresh token đã hết hạn! Vui lòng đăng nhập lại.");
        }

        User user = refreshToken.getUser();

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        List<Token> validTokens = tokenRepository.findAllValidTokensByUser(user.getId());
        validTokens.forEach(t -> {
            t.setExpired(true);
            t.setRevoked(true);
        });
        tokenRepository.saveAll(validTokens);

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole().name());
        String newAccessToken = jwtService.generateAccessToken(extraClaims, user);

        Token newToken = Token.builder()
                .user(user)
                .token(newAccessToken)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(newToken);

        String newRefreshTokenStr = jwtService.generateRefreshToken(user);
        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .token(newRefreshTokenStr)
                .expiryDate(Instant.now().plus(7, ChronoUnit.DAYS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newRefreshToken);

        return LoginResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .build();
    }

    // PRIVATE HELPERS

    private void validateRegisterInfo(RegisterRequestDTO dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp!");
        }
    }

    private String createVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiryDate(Instant.now().plus(24, ChronoUnit.HOURS));
        return token;
    }

    private String capitalizeName(String name) {
        if (name == null || name.isBlank()) return "";
        String[] words = name.toLowerCase().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                sb.append(Character.toUpperCase(word.charAt(0)))
                  .append(word.substring(1).toLowerCase())
                  .append(" ");
            }
        }
        return sb.toString().trim();
    }
}