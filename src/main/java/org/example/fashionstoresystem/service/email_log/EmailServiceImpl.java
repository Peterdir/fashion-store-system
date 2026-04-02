package org.example.fashionstoresystem.service.email_log;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.entity.jpa.EmailLog;
import org.example.fashionstoresystem.repository.EmailLogRepository;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailLogRepository emailLogRepository;
    private final SpringTemplateEngine templateEngine;

    @Override
    public Boolean sendVerificationEmail(String email, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String subject = "Xác thực tài khoản H&Y | H&Y Fashion";
            String verificationLink = "http://localhost:8080/verify-email?token=" + token;
            
            // Render HTML using Thymeleaf TemplateEngine
            Context context = new Context();
            context.setVariable("verificationLink", verificationLink);
            String htmlContent = templateEngine.process("mail/verification-email", context);

            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);

            // Lưu log
            saveLog(email, "HTML Verification Email Sent via Template to " + email);
            return true;
        } catch (Exception e) {
            saveLog(email, "FAILED to send HTML email: " + e.getMessage());
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

