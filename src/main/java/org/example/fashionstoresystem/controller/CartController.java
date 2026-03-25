package org.example.fashionstoresystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.AddToCartRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateCartItemRequestDTO;
import org.example.fashionstoresystem.dto.response.CartItemResponseDTO;
import org.example.fashionstoresystem.dto.response.CartResponseDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.service.cart_item.CartService;
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
    public ResponseEntity<CartResponseDTO> getCartItems(
            @RequestParam Long userId
    ) {
        CartResponseDTO response = cartService.getCartItems(userId);
        return ResponseEntity.ok(response);
    }

    // THÊM VÀO GIỎ
    @PostMapping
    public ResponseEntity<CartItemResponseDTO> addToCart(
            @RequestParam Long userId,
            @RequestBody AddToCartRequestDTO dto
    ) {
        CartItemResponseDTO response = cartService.addToCart(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // CẬP NHẬT SỐ LƯỢNG
    @PutMapping("/items")
    public ResponseEntity<CartItemResponseDTO> updateCartItem(
            @RequestParam Long userId,
            @RequestBody UpdateCartItemRequestDTO dto
    ) {
        CartItemResponseDTO response = cartService.updateCartItem(userId, dto);
        return ResponseEntity.ok(response);
    }

    // XÓA KHỎI GIỎ
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<MessageResponseDTO> removeCartItem(
            @RequestParam Long userId,
            @PathVariable Long itemId
    ) {
        MessageResponseDTO response = cartService.removeCartItem(userId, itemId);
        return ResponseEntity.ok(response);
    }
}
