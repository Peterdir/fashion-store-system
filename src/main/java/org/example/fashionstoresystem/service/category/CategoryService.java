package org.example.fashionstoresystem.service.category;

import org.example.fashionstoresystem.dto.response.CategoryResponseDTO;

import java.util.List;

public interface CategoryService {

    // Lấy tất cả danh mục gốc (không có cha)
    List<CategoryResponseDTO> getRootCategories();

    // Lấy danh mục con theo ID danh mục cha
    List<CategoryResponseDTO> getSubcategoriesByParentId(Long parentId);

    // Lấy danh mục con theo tên danh mục cha
    List<CategoryResponseDTO> getSubcategoriesByParentName(String parentName);
}
