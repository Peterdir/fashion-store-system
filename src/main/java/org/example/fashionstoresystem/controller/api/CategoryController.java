package org.example.fashionstoresystem.controller.api;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.CategoryResponseDTO;
import org.example.fashionstoresystem.service.category.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // Lấy tất cả danh mục gốc (không có cha)
    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getRootCategories() {
        return ResponseEntity.ok(categoryService.getRootCategories());
    }

    // Lấy danh mục con theo ID danh mục cha
    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<CategoryResponseDTO>> getSubcategories(@PathVariable Long parentId) {
        return ResponseEntity.ok(categoryService.getSubcategoriesByParentId(parentId));
    }

    // Lấy danh mục con theo tên danh mục cha
    @GetMapping("/by-name")
    public ResponseEntity<List<CategoryResponseDTO>> getSubcategoriesByName(
            @RequestParam String parentName) {
        return ResponseEntity.ok(categoryService.getSubcategoriesByParentName(parentName));
    }
}
