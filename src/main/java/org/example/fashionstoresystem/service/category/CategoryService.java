package org.example.fashionstoresystem.service.category;

import org.example.fashionstoresystem.dto.request.CategoryRequestDTO;
import org.example.fashionstoresystem.dto.response.CategoryResponseDTO;

import java.util.List;

public interface CategoryService {

    // Frontend public methods
    List<CategoryResponseDTO> getRootCategories();
    List<CategoryResponseDTO> getSubcategoriesByParentId(Long parentId);
    List<CategoryResponseDTO> getSubcategoriesByParentName(String parentName);

    // Admin CRUD methods
    List<CategoryResponseDTO> getAllCategoriesAdmin();
    CategoryResponseDTO getCategoryById(Long id);
    CategoryResponseDTO createCategory(CategoryRequestDTO request);
    CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO request);
    void deleteCategory(Long id);
}
