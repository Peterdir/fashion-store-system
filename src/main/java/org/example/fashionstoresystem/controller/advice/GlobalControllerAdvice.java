package org.example.fashionstoresystem.controller.advice;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.service.product.ProductService;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.List;

@ControllerAdvice
@RequiredArgsConstructor
public class GlobalControllerAdvice {

    private final ProductService productService;

    @ModelAttribute("categories")
    public List<String> getCategories() {
        return productService.getAllCategories();
    }
}
