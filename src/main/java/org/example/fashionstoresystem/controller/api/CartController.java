package org.example.fashionstoresystem.controller.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.AddToCartRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateCartItemRequestDTO;
import org.example.fashionstoresystem.dto.response.CartItemResponseDTO;
import org.example.fashionstoresystem.dto.response.CartResponseDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.service.cart_item.CartService;
import org.example.fashionstoresystem.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // XEM GIỎ HÀNG
    @GetMapping
    public ResponseEntity<CartResponseDTO> getCartItems() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        CartResponseDTO response = cartService.getCartItems(userId);
        return ResponseEntity.ok(response);
    }

    // THÊM VÀO GIỎ
    @PostMapping
    public ResponseEntity<CartItemResponseDTO> addToCart(
            @Valid @RequestBody AddToCartRequestDTO dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        CartItemResponseDTO response = cartService.addToCart(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // CẬP NHẬT SỐ LƯỢNG
    @PutMapping("/items")
    public ResponseEntity<CartItemResponseDTO> updateCartItem(
            @Valid @RequestBody UpdateCartItemRequestDTO dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        CartItemResponseDTO response = cartService.updateCartItem(userId, dto);
        return ResponseEntity.ok(response);
    }

    // XÓA KHỎI GIỎ
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<MessageResponseDTO> removeCartItem(
            @PathVariable Long itemId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        MessageResponseDTO response = cartService.removeCartItem(userId, itemId);
        return ResponseEntity.ok(response);
    }
}
