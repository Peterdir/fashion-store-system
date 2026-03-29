package org.example.fashionstoresystem.controller.api;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.LoginRequestDTO;
import org.example.fashionstoresystem.dto.response.LoginResponseDTO;
import org.example.fashionstoresystem.service.auth.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller chuyên xử lý xác thực qua Cookie.
 * Tách riêng khỏi AuthController (REST thuần) để tuân thủ SRP.
 */
@RestController
@RequestMapping("/api/auth/cookie")
@RequiredArgsConstructor
public class CookieAuthController {

    private static final String ACCESS_TOKEN_COOKIE = "accessToken";
    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpirationMs;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMs;

    private final AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequestDTO dto,
            HttpServletResponse response
    ) {
        LoginResponseDTO loginResponse = authService.login(dto);

        // Set JWT vào HttpOnly Cookie (chuyển ms → giây)
        addCookie(response, ACCESS_TOKEN_COOKIE, loginResponse.getAccessToken(), accessTokenExpirationMs / 1000);
        addCookie(response, REFRESH_TOKEN_COOKIE, loginResponse.getRefreshToken(), refreshTokenExpirationMs / 1000);

        // Trả về thông tin user (không gửi token trong body)
        return ResponseEntity.ok(Map.of(
                "userId", loginResponse.getUserId(),
                "fullName", loginResponse.getFullName(),
                "email", loginResponse.getEmail(),
                "role", loginResponse.getRole()
        ));
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Xóa cookie bằng cách set maxAge = 0
        addCookie(response, ACCESS_TOKEN_COOKIE, "", 0);
        addCookie(response, REFRESH_TOKEN_COOKIE, "", 0);
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }

    private void addCookie(HttpServletResponse response, String name, String value, long maxAgeSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Đặt true khi deploy HTTPS
        cookie.setPath("/");
        cookie.setMaxAge((int) maxAgeSeconds);
        response.addCookie(cookie);
    }
}
