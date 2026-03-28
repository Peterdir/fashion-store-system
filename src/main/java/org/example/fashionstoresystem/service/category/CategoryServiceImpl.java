package org.example.fashionstoresystem.service.category;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.CategoryResponseDTO;
import org.example.fashionstoresystem.entity.jpa.Category;
import org.example.fashionstoresystem.entity.jpa.Product;
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

    private CategoryResponseDTO mapCategory(Category cat) {
        return CategoryResponseDTO.builder()
                .id(cat.getId())
                .name(cat.getName())
                .childCount(cat.getChildren() != null ? cat.getChildren().size() : 0)
                .imageUrl(getRepresentativeImage(cat))
                .children(cat.getChildren() != null ? cat.getChildren().stream()
                        .map(child -> CategoryResponseDTO.builder()
                                .id(child.getId())
                                .name(child.getName())
                                .imageUrl(getRepresentativeImage(child))
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
                .imageUrl(getRepresentativeImage(cat))
                .build();
    }

    private String getRepresentativeImage(Category cat) {
        // Ưu tiên lấy ảnh từ sản phẩm của chính danh mục này
        if (cat.getProducts() != null && !cat.getProducts().isEmpty()) {
            for (Product p : cat.getProducts()) {
                if (p.getImages() != null && !p.getImages().isEmpty()) {
                    return p.getImages().get(0).getUrl();
                }
            }
        }
        
        // Nếu không có sản phẩm trực tiếp, thử lấy từ danh mục con đầu tiên có sản phẩm
        if (cat.getChildren() != null && !cat.getChildren().isEmpty()) {
            for (Category child : cat.getChildren()) {
                String childImg = getRepresentativeImage(child);
                if (childImg != null) return childImg;
            }
        }
        
        return "/images/placeholder.png";
    }
}
