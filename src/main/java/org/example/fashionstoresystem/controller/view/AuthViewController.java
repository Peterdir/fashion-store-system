package org.example.fashionstoresystem.controller.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AuthViewController {

    @GetMapping("/login")
    public String login() {
        return "pages/login";
    }

    @GetMapping("/register")
    public String register() {
        return "pages/register";
    }

    @GetMapping("/forgot-password")
    public String forgotPassword() {
        return "pages/forgot-password";
    }

    @GetMapping("/reset-password")
    public String resetPassword() {
        return "pages/reset-password";
    }
}
