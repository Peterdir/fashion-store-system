package org.example.fashionstoresystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.ChangePasswordRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateProfileRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.ProfileResponseDTO;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.exception.UnauthenticatedException;
import org.example.fashionstoresystem.service.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // XEM THÔNG TIN CÁ NHÂN
    @GetMapping("/me")
    public ResponseEntity<ProfileResponseDTO> getProfile() {
        Long userId = getAuthenticatedUserId();
        ProfileResponseDTO response = userService.getProfile(userId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // CẬP NHẬT THÔNG TIN
    @PutMapping("/me")
    public ResponseEntity<ProfileResponseDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequestDTO dto) {
        Long userId = getAuthenticatedUserId();
        ProfileResponseDTO response = userService.updateProfile(userId, dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // ĐỔI MẬT KHẨU
    @PutMapping("/me/password")
    public ResponseEntity<MessageResponseDTO> changePassword(
            @Valid @RequestBody ChangePasswordRequestDTO dto) {
        Long userId = getAuthenticatedUserId();
        MessageResponseDTO response = userService.changePassword(userId, dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // TRÍCH XUẤT userId TỪ SECURITY CONTEXT
    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new UnauthenticatedException("Vui lòng đăng nhập để thực hiện chức năng này!");
        }
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}
