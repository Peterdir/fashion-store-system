package org.example.fashionstoresystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.ChangePasswordRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateProfileRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.ProfileResponseDTO;
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

        Long userId = Long.parseLong(principal.getName());

        ProfileResponseDTO response = userService.getProfile(userId);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // CẬP NHẬT THÔNG TIN
    @PutMapping("/me")
    public ResponseEntity<ProfileResponseDTO> updateProfile(
            Principal principal,
            @RequestBody UpdateProfileRequestDTO dto
    ) {

        Long userId = Long.parseLong(principal.getName());

        ProfileResponseDTO response = userService.updateProfile(userId, dto);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // ĐỔI MẬT KHẨU
    @PutMapping("/me/password")
    public ResponseEntity<MessageResponseDTO> changePassword(
            Principal principal,
            @RequestBody ChangePasswordRequestDTO dto
    ) {

        Long userId = Long.parseLong(principal.getName());

        MessageResponseDTO response = userService.changePassword(userId, dto);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
