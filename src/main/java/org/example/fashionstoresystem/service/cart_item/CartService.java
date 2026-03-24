package org.example.fashionstoresystem.service.cart_item;

import org.example.fashionstoresystem.dto.request.AddToCartRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateCartItemRequestDTO;
import org.example.fashionstoresystem.dto.response.CartItemResponseDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;

import java.util.List;

public interface CartService {
    // Quản lý giỏ hàng - Xem giỏ hàng
    List<CartItemResponseDTO> getCartItems(Long userId);

    // Thêm vào giỏ hàng
    CartItemResponseDTO addToCart(Long userId, AddToCartRequestDTO dto);

    // Cập nhật số lượng sản phẩm trong giỏ
    CartItemResponseDTO updateCartItem(Long userId, UpdateCartItemRequestDTO dto);

    // Xóa sản phẩm khỏi giỏ hàng
    MessageResponseDTO removeCartItem(Long userId, Long cartItemId);
}
