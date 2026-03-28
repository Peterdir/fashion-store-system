package org.example.fashionstoresystem.controller.view;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.ProductDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.ProductSummaryResponseDTO;
import org.example.fashionstoresystem.service.product.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
        
        model.addAttribute("product", product);
        model.addAttribute("relatedProducts", relatedProducts);
        
        return "pages/product-detail";
    }
}
