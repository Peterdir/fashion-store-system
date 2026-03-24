package org.example.fashionstoresystem.service.email_log;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.entity.jpa.EmailLog;
import org.example.fashionstoresystem.repository.EmailLogRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailLogRepository emailLogRepository;

    @Override
    public Boolean sendVerificationEmail(String email, String token) {
        String content = "";
        try {
            // Chuẩn bị nội dung Email
            String subject = "Xác thực tài khoản Fashion Store";
            String link = "http://localhost:8080/api/auth/verify?token=" + token;
            content = "Chào bạn,\n\nVui lòng click vào link sau để xác thực tài khoản của bạn:\n" + link
                    + "\n\nCảm ơn bạn!";

            // Gửi email
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);

            // Lưu log
            saveLog(email, "SUCCESS: " + content);
            return true;
        } catch (Exception e) {
            // Lưu log lỗi
            saveLog(email, "FAILED: " + e.getMessage());
            throw new RuntimeException("Không thể gửi email xác thực!");
        }
    }

    private void saveLog(String toEmail, String content) {
        EmailLog emailLog = EmailLog.builder()
                .toEmail(toEmail)
                .content(content)
                .sentAt(new Date())
                .build();
        emailLogRepository.save(emailLog);
    }
}
