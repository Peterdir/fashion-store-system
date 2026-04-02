package org.example.fashionstoresystem.controller.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PolicyViewController {

    @GetMapping("/policy")
    public String policy() {
        return "pages/policy";
    }
}
