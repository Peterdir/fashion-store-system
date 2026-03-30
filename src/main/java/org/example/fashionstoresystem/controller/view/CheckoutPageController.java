package org.example.fashionstoresystem.controller.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class CheckoutPageController {

    @GetMapping("/checkout")
    public String checkout() {
        return "pages/checkout";
    }
}
