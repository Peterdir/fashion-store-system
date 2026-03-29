package org.example.fashionstoresystem.controller.view;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.ProfileResponseDTO;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.service.user.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class UserViewController {

    private final UserService userService;

    @GetMapping("/personal-center")
    public String personalCenter(Model model) {
        // Lấy thông tin người dùng hiện tại từ SecurityContext
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        if (principal instanceof User user) {
            ProfileResponseDTO profile = userService.getProfile(user.getId());
            model.addAttribute("username", profile.getEmail());
            model.addAttribute("fullName", profile.getFullName());
            model.addAttribute("email", profile.getEmail());
            model.addAttribute("phone", profile.getPhone());
            model.addAttribute("address", profile.getAddress());
            model.addAttribute("twoFactorEnabled", user.isTwoFactorEnabled());
        } else {
            // Mock data cho việc test UI khi chưa đăng nhập hoặc chạy local
            model.addAttribute("username", "Guest User");
            model.addAttribute("fullName", "KHANH DUY LAM");
            model.addAttribute("email", "lamkhanhduy123kg@gmail.com");
            model.addAttribute("phone", "0123456789");
            model.addAttribute("address", "123 Fashion Street, District 1, Ho Chi Minh City");
            model.addAttribute("twoFactorEnabled", false);
        }
        
        return "pages/personal-center";
    }
}
