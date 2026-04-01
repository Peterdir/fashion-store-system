package org.example.fashionstoresystem.controller.view;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.CartResponseDTO;
import org.example.fashionstoresystem.service.cart_item.CartService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class CartViewController {

    private final CartService cartService;

    @GetMapping("/cart")
    public String cart(@RequestParam(required = false, defaultValue = "1") Long userId, Model model) {
        CartResponseDTO cart = cartService.getCartItems(userId);
        model.addAttribute("cartItems", cart.getItems());
        model.addAttribute("totalItems", cart.getItems().size());
        model.addAttribute("subtotal", cart.getTotalAmount());
        model.addAttribute("discount", 0.0);
        model.addAttribute("grandTotal", cart.getTotalAmount());
        return "pages/cart";
    }
}
