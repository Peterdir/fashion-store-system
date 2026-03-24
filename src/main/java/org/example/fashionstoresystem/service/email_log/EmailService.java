package org.example.fashionstoresystem.service.email_log;

public interface EmailService {
    Boolean sendVerificationEmail (String email, String token);
}
