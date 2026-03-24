package org.example.fashionstoresystem.service.otp;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.TwoFactorSetupRequestDTO;
import org.example.fashionstoresystem.dto.request.VerifyOtpRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.TwoFactorStatusResponseDTO;
import org.example.fashionstoresystem.entity.jpa.Otp;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.repository.OtpRepository;
import org.example.fashionstoresystem.repository.UserRepository;
import org.example.fashionstoresystem.service.email_log.EmailService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;

    // Bước 2: Hiển thị trạng thái xác thực 2 bước hiện tại
    @Override
    public TwoFactorStatusResponseDTO getTwoFactorStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        return TwoFactorStatusResponseDTO.builder()
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .message(user.isTwoFactorEnabled()
                        ? "Xác thực 2 bước đang được bật."
                        : "Xác thực 2 bước đang tắt.")
                .build();
    }

    // Bước 3-4: Bật hoặc tắt xác thực 2 bước
    @Override
    @Transactional
    public MessageResponseDTO setupTwoFactor(Long userId, TwoFactorSetupRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        // AF1: Khách hàng tắt xác thực 2 bước
        if (!dto.isEnable()) {
            user.setTwoFactorEnabled(false);
            userRepository.save(user);
            // Xóa OTP cũ nếu có
            otpRepository.deleteByUserEmail(user.getEmail());

            return MessageResponseDTO.builder()
                    .message("Đã tắt xác thực 2 bước thành công!")
                    .build();
        }

        // Bật xác thực 2 bước → Gửi OTP qua email
        if (user.isTwoFactorEnabled()) {
            return MessageResponseDTO.builder()
                    .message("Xác thực 2 bước đã được bật trước đó!")
                    .build();
        }

        // Xóa OTP cũ trước khi tạo mới
        otpRepository.deleteByUserEmail(user.getEmail());

        // Tạo mã OTP
        String otpCode = generateOtpCode();
        Otp otp = Otp.builder()
                .user(user)
                .code(otpCode)
                .expiryTime(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES))
                .used(false)
                .build();
        otpRepository.save(otp);

        // Gửi mã OTP qua email
        // EL2: Không gửi được mã xác thực
        try {
            emailService.sendVerificationEmail(user.getEmail(), "Mã xác thực 2 bước của bạn: " + otpCode);
        } catch (Exception e) {
            throw new RuntimeException("Không thể gửi mã xác thực! Vui lòng thử lại sau.");
        }

        return MessageResponseDTO.builder()
                .message("Mã xác thực đã được gửi đến email " + user.getEmail() + ". Vui lòng nhập mã để hoàn tất.")
                .build();
    }

    // Bước 5-7: Xác minh mã OTP
    @Override
    @Transactional
    public TwoFactorStatusResponseDTO verifyOtp(Long userId, VerifyOtpRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        // EL1: Mã xác thực không hợp lệ
        Otp otp = otpRepository.findByUserEmailAndCode(user.getEmail(), dto.getOtpCode())
                .orElseThrow(() -> new RuntimeException("Mã xác thực không hợp lệ!"));

        if (otp.isUsed()) {
            throw new RuntimeException("Mã xác thực đã được sử dụng!");
        }

        if (otp.getExpiryTime().isBefore(Instant.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn!");
        }

        // Kích hoạt xác thực 2 bước
        otp.setUsed(true);
        otpRepository.save(otp);

        user.setTwoFactorEnabled(true);
        userRepository.save(user);

        return TwoFactorStatusResponseDTO.builder()
                .twoFactorEnabled(true)
                .message("Kích hoạt xác thực 2 bước thành công!")
                .build();
    }

    // Tạo mã OTP 6 chữ số
    private String generateOtpCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt((int) Math.pow(10, OTP_LENGTH));
        return String.format("%0" + OTP_LENGTH + "d", code);
    }
}
