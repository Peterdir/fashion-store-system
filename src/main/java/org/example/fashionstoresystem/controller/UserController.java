package org.example.fashionstoresystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.ChangePasswordRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateProfileRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.ProfileResponseDTO;
import org.example.fashionstoresystem.exception.UnauthenticatedException;
import org.example.fashionstoresystem.service.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // XEM THÔNG TIN CÁ NHÂN
    @GetMapping("/me")
    public ResponseEntity<ProfileResponseDTO> getProfile(Principal principal) {
        Long userId = getAuthenticatedUserId(principal);
        ProfileResponseDTO response = userService.getProfile(userId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // CẬP NHẬT THÔNG TIN
    @PutMapping("/me")
    public ResponseEntity<ProfileResponseDTO> updateProfile(
            Principal principal,
            @RequestBody UpdateProfileRequestDTO dto
    ) {
        Long userId = getAuthenticatedUserId(principal);
        ProfileResponseDTO response = userService.updateProfile(userId, dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // ĐỔI MẬT KHẨU
    @PutMapping("/me/password")
    public ResponseEntity<MessageResponseDTO> changePassword(
            Principal principal,
            @RequestBody ChangePasswordRequestDTO dto
    ) {
        Long userId = getAuthenticatedUserId(principal);
        MessageResponseDTO response = userService.changePassword(userId, dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // TRÍCH XUẤT userId TỪ Principal ĐÃ XÁC THỰC
    private Long getAuthenticatedUserId(Principal principal) {
        if (principal == null) {
            throw new UnauthenticatedException("Vui lòng đăng nhập để thực hiện chức năng này!");
        }
        return Long.parseLong(principal.getName());
    }
}

