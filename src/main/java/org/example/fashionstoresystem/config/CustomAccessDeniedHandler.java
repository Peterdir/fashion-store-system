package org.example.fashionstoresystem.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        // Nếu là request từ trình duyệt lấy giao diện HTML, chuyển hướng về trang đăng nhập
        String acceptHeader = request.getHeader("Accept");
        if (acceptHeader != null && acceptHeader.contains("text/html")) {
            if (request.getRequestURI().startsWith("/admin")) {
                response.sendRedirect("/admin/login?error=access_denied");
            } else {
                response.sendRedirect("/login?error=access_denied");
            }
            return;
        }

        // Trả về 403 Forbidden cho các API request
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        MessageResponseDTO errorResponse = MessageResponseDTO.builder()
                .message("Bạn không có quyền truy cập vào tài nguyên này. Vui lòng kiểm tra quyền hạn của bạn!")
                .build();

        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(errorResponse));
    }
}
