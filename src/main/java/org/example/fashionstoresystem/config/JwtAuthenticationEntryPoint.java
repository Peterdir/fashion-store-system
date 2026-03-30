package org.example.fashionstoresystem.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        String acceptHeader = request.getHeader("Accept");
        if (acceptHeader != null && acceptHeader.contains("text/html")) {
            // Đây là request từ trình duyệt lấy giao diện HTML, nên chuyển hướng về trang đăng nhập
            if (request.getRequestURI().startsWith("/admin")) {
                response.sendRedirect("/admin/login");
            } else {
                response.sendRedirect("/login");
            }
            return;
        }

        // Trả về 401 Unauthorized thay vì 403 Forbidden khi chưa đăng nhập cho các API request
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        MessageResponseDTO errorResponse = MessageResponseDTO.builder()
                .message("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!")
                .build();

        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(errorResponse));
    }
}
