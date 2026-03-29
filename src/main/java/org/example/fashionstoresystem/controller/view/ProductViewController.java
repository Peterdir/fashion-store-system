package org.example.fashionstoresystem.controller.view;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.ProductDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.ProductSummaryResponseDTO;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.service.product.ProductService;
import org.example.fashionstoresystem.service.recently_viewed.RecentlyViewedService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ProductViewController {

    private final ProductService productService;
    private final RecentlyViewedService recentlyViewedService;

    @GetMapping("/category")
    public String category(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 12) Pageable pageable,
            Model model) {
        Page<ProductSummaryResponseDTO> products = productService.getProducts(keyword, pageable);
        model.addAttribute("products", products);
        model.addAttribute("keyword", keyword);
        return "pages/category";
    }

    @GetMapping("/product-detail/{productId}")
    public String productDetail(@PathVariable Long productId, Model model) {
        ProductDetailResponseDTO product = productService.getProductDetail(productId);
        List<ProductSummaryResponseDTO> relatedProducts = productService.getRelatedProducts(productId, 4);
        
        // Track View History if logged in
        String currentEmail = getCurrentUserEmail();
        if (currentEmail != null && !currentEmail.equals("anonymousUser")) {
            recentlyViewedService.trackView(currentEmail, productId);
        }
        
        model.addAttribute("product", product);
        model.addAttribute("relatedProducts", relatedProducts);
        
        return "pages/product-detail";
    }

    private String getCurrentUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal instanceof User) {
            return ((User) principal).getEmail();
        } else if (principal instanceof String) {
            return (String) principal;
        }
        return null;
    }
}
