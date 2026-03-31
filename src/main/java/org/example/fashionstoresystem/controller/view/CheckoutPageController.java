package org.example.fashionstoresystem.controller.view;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.service.payment.MomoService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class CheckoutPageController {

    private final MomoService momoService;

    @GetMapping("/checkout")
    public String checkout() {
        return "pages/checkout";
    }

    @GetMapping("/checkout/payment-summary")
    public String paymentSummary(@RequestParam("orderId") Long orderId, Model model) {
        model.addAttribute("orderId", orderId);
        return "pages/payment-summary";
    }

    @GetMapping("/mock/momo-payment")
    public String mockMomoPayment(@RequestParam("orderId") String orderId, 
                                  @RequestParam("amount") String amount, 
                                  Model model) {
        String mockReturnUrl = momoService.generateMockReturnUrl(orderId, amount);
        model.addAttribute("amount", amount);
        model.addAttribute("orderId", orderId);
        model.addAttribute("returnUrl", mockReturnUrl);
        return "pages/mock-momo";
    }
}
