package org.example.fashionstoresystem.controller.view;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.ProfileResponseDTO;
import org.example.fashionstoresystem.dto.response.RecentlyViewedResponseDTO;
import org.example.fashionstoresystem.dto.response.WishlistItemResponseDTO;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.service.auth.AuthService;
import org.example.fashionstoresystem.service.user.UserService;
import org.example.fashionstoresystem.service.wishlist_item.WishlistService;
import org.example.fashionstoresystem.service.recently_viewed.RecentlyViewedService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class UserViewController {

    private final AuthService authService;
    private final UserService userService;
    private final WishlistService wishlistService;
    private final RecentlyViewedService recentlyViewedService;

    @GetMapping("/auth-notice")
    public String authNotice(String email, String type, Model model) {
        model.addAttribute("email", email);
        model.addAttribute("type", type); // 'verify-email' or 'reset-password'
        return "pages/auth-notice";
    }

    @GetMapping("/verify-email")
    public String verifyEmail(String token, Model model) {
        try {
            boolean success = authService.verifyEmail(token);
            model.addAttribute("success", success);
            model.addAttribute("message", "Tài khoản của bạn đã được xác thực thành công!");
        } catch (Exception e) {
            model.addAttribute("success", false);
            model.addAttribute("message", e.getMessage());
        }
        return "pages/verify-email-result";
    }

    @GetMapping("/personal-center")
    public String personalCenter(Model model) {
        // Lấy thông tin người dùng hiện tại từ SecurityContext
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<WishlistItemResponseDTO> wishlist;
        List<RecentlyViewedResponseDTO> recentlyViewed;

        if (principal instanceof User user) {
            ProfileResponseDTO profile = userService.getProfile(user.getId());
            model.addAttribute("username", profile.getEmail());
            model.addAttribute("fullName", profile.getFullName());
            model.addAttribute("email", profile.getEmail());
            model.addAttribute("phone", profile.getPhone());
            model.addAttribute("address", profile.getAddress());
            model.addAttribute("twoFactorEnabled", user.isTwoFactorEnabled());
            
            wishlist = wishlistService.getWishlist(user.getId());
            recentlyViewed = recentlyViewedService.getRecentlyViewed(user.getId());
        } else {
            // Mock data cho việc test UI khi chưa đăng nhập hoặc chạy local
            model.addAttribute("username", "Guest User");
            model.addAttribute("fullName", "KHANH DUY LAM");
            model.addAttribute("email", "lamkhanhduy123kg@gmail.com");
            model.addAttribute("phone", "0123456789");
            model.addAttribute("address", "123 Fashion Street, District 1, Ho Chi Minh City");
            model.addAttribute("twoFactorEnabled", false);
            
            // Mock wishlist data for Guest
            wishlist = List.of(
                WishlistItemResponseDTO.builder()
                    .wishlistItemId(1L)
                    .productName("Structured Cotton Polo Shirt")
                    .productPrice(89.00)
                    .categoryName("Shirts")
                    .inStock(true)
                    .primaryImageUrl("https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop")
                    .build(),
                WishlistItemResponseDTO.builder()
                    .wishlistItemId(2L)
                    .productName("Slim Fit Denim Jeans")
                    .productPrice(129.00)
                    .categoryName("Pants")
                    .inStock(false)
                    .primaryImageUrl("https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop")
                    .build()
            );
            recentlyViewed = List.of();
        }

        // Extract unique categories from wishlist
        Set<String> uniqueCategories = wishlist.stream()
                .map(WishlistItemResponseDTO::getCategoryName)
                .collect(Collectors.toSet());

        model.addAttribute("wishlist", wishlist);
        model.addAttribute("wishlistCategories", uniqueCategories);
        model.addAttribute("recentlyViewed", recentlyViewed);
        
        return "pages/personal-center";
    }
}
