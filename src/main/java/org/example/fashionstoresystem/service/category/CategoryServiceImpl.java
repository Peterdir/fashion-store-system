package org.example.fashionstoresystem.service.category;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.CategoryRequestDTO;
import org.example.fashionstoresystem.dto.response.CategoryResponseDTO;
import org.example.fashionstoresystem.entity.jpa.Category;
import org.example.fashionstoresystem.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getRootCategories() {
        List<Category> roots = categoryRepository.findByParentIsNull();
        return roots.stream()
                .map(this::mapCategory)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getSubcategoriesByParentId(Long parentId) {
        List<Category> children = categoryRepository.findByParentId(parentId);
        return children.stream()
                .map(this::mapCategory)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getSubcategoriesByParentName(String parentName) {
        Category parent = categoryRepository.findByName(parentName).orElse(null);
        if (parent == null) {
            return List.of();
        }
        List<Category> children = categoryRepository.findByParentId(parent.getId());
        return children.stream()
                .map(this::mapCategory)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAllCategoriesAdmin() {
        return categoryRepository.findAll().stream()
                .map(this::mapCategoryPlain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponseDTO getCategoryById(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return mapCategoryPlain(cat);
    }

    @Override
    @Transactional
    public CategoryResponseDTO createCategory(CategoryRequestDTO request) {
        Category category = Category.builder()
                .name(request.getName())
                .build();
        
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
        }
        
        return mapCategoryPlain(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        category.setName(request.getName());
        
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new RuntimeException("Category cannot be its own parent");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
        
        return mapCategoryPlain(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found");
        }
        categoryRepository.deleteById(id);
    }

    private CategoryResponseDTO mapCategoryPlain(Category cat) {
        return CategoryResponseDTO.builder()
                .id(cat.getId())
                .name(cat.getName())
                .childCount(cat.getChildren() != null ? cat.getChildren().size() : 0)
                .parentId(cat.getParent() != null ? cat.getParent().getId() : null)
                .parentName(cat.getParent() != null ? cat.getParent().getName() : null)
                .build();
    }

    private CategoryResponseDTO mapCategory(Category cat) {
        return CategoryResponseDTO.builder()
                .id(cat.getId())
                .name(cat.getName())
                .childCount(cat.getChildren() != null ? cat.getChildren().size() : 0)
                .parentId(cat.getParent() != null ? cat.getParent().getId() : null)
                .parentName(cat.getParent() != null ? cat.getParent().getName() : null)
                .children(cat.getChildren() != null ? cat.getChildren().stream()
                        .map(child -> CategoryResponseDTO.builder()
                                .id(child.getId())
                                .name(child.getName())
                                .parentId(cat.getId())
                                .parentName(cat.getName())
                                .childCount(child.getChildren() != null ? child.getChildren().size() : 0)
                                .children(child.getChildren() != null ? child.getChildren().stream()
                                        .map(this::mapCategoryBasic)
                                        .collect(Collectors.toList()) : new ArrayList<>())
                                .build())
                        .collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }

    private CategoryResponseDTO mapCategoryBasic(Category cat) {
        return CategoryResponseDTO.builder()
                .id(cat.getId())
                .name(cat.getName())
                .childCount(cat.getChildren() != null ? cat.getChildren().size() : 0)
                .parentId(cat.getParent() != null ? cat.getParent().getId() : null)
                .parentName(cat.getParent() != null ? cat.getParent().getName() : null)
                .build();
    }
}
