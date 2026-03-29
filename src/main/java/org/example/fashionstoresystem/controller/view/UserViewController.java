package org.example.fashionstoresystem.controller.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserViewController {

    @GetMapping("/personal-center")
    public String personalCenter() {
        return "pages/personal-center";
    }
}
