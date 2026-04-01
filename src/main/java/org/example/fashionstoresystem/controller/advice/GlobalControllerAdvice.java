package org.example.fashionstoresystem.controller.advice;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.CategoryResponseDTO;
import org.example.fashionstoresystem.service.category.CategoryService;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.List;

@ControllerAdvice
@RequiredArgsConstructor
public class GlobalControllerAdvice {

    private final CategoryService categoryService;

    @ModelAttribute("categories")
    public List<CategoryResponseDTO> getCategories() {
        return categoryService.getRootCategories();
    }
}
