package org.example.fashionstoresystem.service.auth;

import org.example.fashionstoresystem.dto.request.*;
import org.example.fashionstoresystem.dto.response.LoginResponseDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.RegisterResponseDTO;

public interface AuthService {
    // Đăng ký tài khoản
    RegisterResponseDTO registerNewAccount(RegisterRequestDTO dto);

    // Xác thực email
    Boolean verifyEmail(VerifyEmailRequestDTO dto);

    // Gửi lại xác thực
    Boolean resendVerificationEmail(ResendVerificationEmailRequestDTO dto);

    // Đăng nhập
    LoginResponseDTO login(LoginRequestDTO dto);

    // Quên mật khẩu
    MessageResponseDTO forgotPassword(ForgotPasswordRequestDTO dto);
    MessageResponseDTO resetPassword(ResetPasswordRequestDTO dto);

    // Đăng xuất
    MessageResponseDTO logout(LogoutRequestDTO dto);
}
