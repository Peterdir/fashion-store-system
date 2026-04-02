package org.example.fashionstoresystem.controller.view;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.service.category.CategoryService;
import org.example.fashionstoresystem.service.product.ProductService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class HomeViewController {

    private final CategoryService categoryService;
    private final ProductService productService;

    @GetMapping("/")
    public String index(Model model) {
        // Lấy danh mục gốc (ví dụ: Men, Women, Unisex)
        model.addAttribute("categories", categoryService.getRootCategories());
        
        // Lấy 8 sản phẩm mới nhất
        model.addAttribute("featuredProducts", productService.getProducts(null, null, null, 
                PageRequest.of(0, 8, Sort.by("id").descending())).getContent());
                
        return "pages/index";
    }
}
