package org.example.fashionstoresystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.*;
import org.example.fashionstoresystem.dto.response.LoginResponseDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.RegisterResponseDTO;
import org.example.fashionstoresystem.service.auth.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ĐĂNG KÝ
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(
            @RequestBody RegisterRequestDTO dto
    ) {

        RegisterResponseDTO response = authService.registerNewAccount(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ĐĂNG NHẬP
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login (
            @RequestBody LoginRequestDTO dto
    ) {

        LoginResponseDTO response = authService.login(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // ĐĂNG XUẤT
    @PostMapping("/logout")
    public ResponseEntity<MessageResponseDTO> logout (
            @RequestBody LogoutRequestDTO dto
    ) {

        MessageResponseDTO response = authService.logout(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // XÁC THỰC EMAIL
    @PostMapping("/verify-email")
    public ResponseEntity<Boolean> verifyEmail (
            @RequestBody VerifyEmailRequestDTO dto
    ) {

        Boolean response = authService.verifyEmail(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // GỬI LẠI EMAIL XÁC THỰC
    @PostMapping("/resend-verification")
    public ResponseEntity<Boolean> resendVerification (
            @RequestBody ResendVerificationEmailRequestDTO dto
    ) {

        Boolean response = authService.resendVerificationEmail(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // QUÊN MẬT KHẨU
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponseDTO> forgotPassword (
            @RequestBody ForgotPasswordRequestDTO dto
    ) {

        MessageResponseDTO response = authService.forgotPassword(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // ĐẶT LẠI MẬT KHẨU
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponseDTO> resetPassword (
            @RequestBody ResetPasswordRequestDTO dto
    ) {

        MessageResponseDTO response = authService.resetPassword(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
