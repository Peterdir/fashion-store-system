package org.example.fashionstoresystem.service.product;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.CreateProductRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateProductRequestDTO;
import org.example.fashionstoresystem.dto.response.CategoryResponseDTO;
import org.example.fashionstoresystem.dto.response.ProductDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.ProductSummaryResponseDTO;
import org.example.fashionstoresystem.entity.enums.ProductStatus;
import org.example.fashionstoresystem.entity.jpa.Category;
import org.example.fashionstoresystem.entity.jpa.Product;
import org.example.fashionstoresystem.entity.jpa.ProductImage;
import org.example.fashionstoresystem.entity.jpa.ProductVariant;
import org.example.fashionstoresystem.repository.CategoryRepository;
import org.example.fashionstoresystem.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.example.fashionstoresystem.repository.ProductCleanupRepository;
import org.example.fashionstoresystem.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductCleanupRepository cleanupRepository;
    private final ReviewRepository reviewRepository;

    // Helper: Lấy tên danh mục an toàn (null-safe)
    private String getCategoryName(Product product) {
        return product.getCategory() != null ? product.getCategory().getName() : "Uncategorized";
    }

    // Helper: Lấy tên danh mục cha an toàn
    private String getParentCategoryName(Product product) {
        if (product.getCategory() != null && product.getCategory().getParent() != null) {
            return product.getCategory().getParent().getName();
        }
        return getCategoryName(product);
    }

    @Override
    public Page<ProductSummaryResponseDTO> getProducts(String keyword, Double minPrice, Double maxPrice, Pageable pageable) {
        // Sử dụng phương thức tìm kiếm linh hoạt với Keyword và Lọc giá
        Page<Product> productsPage = productRepository.findFiltered(
                (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null,
                minPrice,
                maxPrice,
                pageable
        );

        // Map Entity sang DTO
        return productsPage.map(product -> ProductSummaryResponseDTO.builder()
                .productId(product.getId())
                .name(product.getName())
                .price(product.getVariants().isEmpty() ? 0.0 : product.getVariants().get(0).getPrice())
                .category(getParentCategoryName(product))
                .subcategory(getCategoryName(product))
                .status(product.getStatus())
                .primaryImageUrl(formatImageUrl(product.getImages().isEmpty() ? "/images/placeholder.png" : product.getImages().get(0).getUrl()))
                .hoverImageUrl(formatImageUrl(product.getImages().size() > 1 ? product.getImages().get(1).getUrl() : (product.getImages().isEmpty() ? "/images/placeholder.png" : product.getImages().get(0).getUrl())))
                .build());
    }

    @Override
    public Page<ProductSummaryResponseDTO> getAdminProducts(String keyword, ProductStatus status, Pageable pageable) {
        Page<Product> productsPage = productRepository.findForAdmin(
                (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null,
                status,
                pageable
        );

        // Map Entity sang DTO
        return productsPage.map(product -> ProductSummaryResponseDTO.builder()
                .productId(product.getId())
                .name(product.getName())
                .price(product.getVariants().isEmpty() ? 0.0 : product.getVariants().get(0).getPrice())
                .category(getParentCategoryName(product))
                .subcategory(getCategoryName(product))
                .status(product.getStatus())
                .primaryImageUrl(formatImageUrl(product.getImages().isEmpty() ? "/images/placeholder.png" : product.getImages().get(0).getUrl()))
                .hoverImageUrl(formatImageUrl(product.getImages().size() > 1 ? product.getImages().get(1).getUrl() : (product.getImages().isEmpty() ? "/images/placeholder.png" : product.getImages().get(0).getUrl())))
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponseDTO getProductDetail(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại hoặc đã bị ngừng kinh doanh!"));

        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        long reviewCount = reviewRepository.countByProductId(productId);

        // Map chi tiết Entity (gồm cả các list phụ) sang DTO
        return ProductDetailResponseDTO.builder()
                .productId(product.getId())
                .name(product.getName())
                .price(product.getVariants().isEmpty() ? 0.0 : product.getVariants().get(0).getPrice())
                .minPrice(product.getVariants().isEmpty() ? 0.0 : product.getVariants().stream().mapToDouble(ProductVariant::getPrice).min().orElse(0.0))
                .category(getParentCategoryName(product))
                .categoryName(getCategoryName(product))
                .description(product.getDescription())
                .status(product.getStatus())
                .averageRating(avgRating != null ? avgRating : 0.0)
                .reviewCount(reviewCount)
                .mainImage(formatImageUrl(product.getImages().isEmpty() ? "/images/placeholder.png" : product.getImages().get(0).getUrl()))
                .hoverImage(formatImageUrl(product.getImages().size() > 1 ? product.getImages().get(1).getUrl() : (product.getImages().isEmpty() ? "/images/placeholder.png" : product.getImages().get(0).getUrl())))
                .images(product.getImages().stream()
                        .map(img -> ProductDetailResponseDTO.ProductImageDTO.builder()
                                .imageId(img.getId())
                                .url(formatImageUrl(img.getUrl()))
                                .color(img.getColor())
                                .build())
                        .collect(Collectors.toList()))
                .variants(product.getVariants().stream()
                        .map(v -> ProductDetailResponseDTO.ProductVariantDTO.builder()
                                .variantId(v.getId())
                                .size(v.getSize())
                                .color(v.getColor())
                                .stockQuantity(v.getStockQuantity())
                                .price(v.getPrice())
                                .build())
                        .collect(Collectors.toList()))
                .reviews(product.getReviews().stream()
                        .map(r -> ProductDetailResponseDTO.ReviewDTO.builder()
                                .reviewId(r.getId())
                                .rating(r.getRating())
                                .comment(r.getComment())
                                .reviewerName(r.getUser() != null ? r.getUser().getFullName() : "Khách hàng H&Y")
                                .size(r.getOrderItem() != null && r.getOrderItem().getProductVariant() != null ? r.getOrderItem().getProductVariant().getSize() : "Freesize")
                                .color(r.getOrderItem() != null && r.getOrderItem().getProductVariant() != null ? r.getOrderItem().getProductVariant().getColor() : "Mặc định")
                                .createdAt(r.getCreatedAt())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private String formatImageUrl(String url) {
        if (url == null) return "/images/placeholder.png";
        if (url.startsWith("http") || url.startsWith("/")) return url;
        return "/" + url;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductSummaryResponseDTO> getRelatedProducts(Long productId, int limit) {
        Product currentProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

        if (currentProduct.getCategory() == null) {
            return List.of();
        }

        // Tìm các sản phẩm cùng danh mục
        Pageable pageable = PageRequest.of(0, limit + 1);
        Page<Product> relatedProducts = productRepository.findByCategoryIds(
                List.of(currentProduct.getCategory().getId()),
                pageable
        );

        return relatedProducts.stream()
                .filter(p -> !p.getId().equals(productId))
                .limit(limit)
                .map(this::mapToSummaryDTO)
                .collect(Collectors.toList());
    }

    private ProductSummaryResponseDTO mapToSummaryDTO(Product p) {
        return ProductSummaryResponseDTO.builder()
                .productId(p.getId())
                .name(p.getName())
                .price(p.getVariants().isEmpty() ? 0.0 : p.getVariants().get(0).getPrice())
                .minPrice(p.getVariants().isEmpty() ? 0.0 : p.getVariants().stream()
                        .mapToDouble(ProductVariant::getPrice)
                        .min().orElse(0.0))
                .category(getCategoryName(p))
                .primaryImageUrl(formatImageUrl(p.getImages().isEmpty() ? "/images/placeholder.png" : p.getImages().get(0).getUrl()))
                .hoverImageUrl(formatImageUrl(p.getImages().size() > 1 ? p.getImages().get(1).getUrl() : (p.getImages().isEmpty() ? "/images/placeholder.png" : p.getImages().get(0).getUrl())))
                .averageRating(reviewRepository.getAverageRatingByProductId(p.getId()) != null ? reviewRepository.getAverageRatingByProductId(p.getId()) : 0.0)
                .reviewCount(reviewRepository.countByProductId(p.getId()))
                .build();
    }

    @Override
    @Transactional
    public ProductDetailResponseDTO createProduct(CreateProductRequestDTO dto) {
        if (dto.getPrice() == null || dto.getPrice() < 0) {
            throw new RuntimeException("Giá sản phẩm không hợp lệ");
        }

        // Tìm hoặc tạo Category từ tên
        Category category = categoryRepository.findByName(dto.getCategory())
                .orElseGet(() -> categoryRepository.save(Category.builder().name(dto.getCategory()).build()));

        Product product = Product.builder()
                .name(dto.getName())
                .category(category)
                .description(dto.getDescription())
                .status(ProductStatus.ACTIVE)
                .build();
        
        if (dto.getImageUrls() != null) {
            for (String url : dto.getImageUrls()) {
                ProductImage img = ProductImage.builder()
                        .url(url)
                        .product(product)
                        .build();
                product.getImages().add(img);
            }
        }
        
        if (dto.getVariants() != null) {
            for (CreateProductRequestDTO.ProductVariantRequestDTO vDto : dto.getVariants()) {
                if (vDto.getStockQuantity() == null || vDto.getStockQuantity() < 0) {
                    throw new RuntimeException("Số lượng tồn kho không hợp lệ");
                }
                ProductVariant variant = ProductVariant.builder()
                        .size(vDto.getSize())
                        .color(vDto.getColor())
                        .stockQuantity(vDto.getStockQuantity())
                        .price(dto.getPrice())
                        .product(product)
                        .build();
                product.getVariants().add(variant);
            }
        }
        
        productRepository.save(product);
        return getProductDetail(product.getId());
    }

    @Override
    @Transactional
    public ProductDetailResponseDTO updateProduct(Long productId, UpdateProductRequestDTO dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

        if (dto.getPrice() != null && dto.getPrice() < 0) {
            throw new RuntimeException("Giá sản phẩm không hợp lệ");
        }

        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getCategory() != null) {
            Category category = categoryRepository.findByName(dto.getCategory())
                    .orElseGet(() -> categoryRepository.save(Category.builder().name(dto.getCategory()).build()));
            product.setCategory(category);
        }
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getStatus() != null) product.setStatus(dto.getStatus());

        if (dto.getImageUrls() != null) {
            product.getImages().clear();
            for (String url : dto.getImageUrls()) {
                ProductImage img = ProductImage.builder()
                        .url(url)
                        .product(product)
                        .build();
                product.getImages().add(img);
            }
        }

        if (dto.getVariants() != null) {
            List<Long> updatedVariantIds = dto.getVariants().stream()
                    .filter(v -> v.getVariantId() != null)
                    .map(UpdateProductRequestDTO.ProductVariantRequestDTO::getVariantId)
                    .toList();
            product.getVariants().removeIf(v -> v.getId() != null && !updatedVariantIds.contains(v.getId()));
            
            for (UpdateProductRequestDTO.ProductVariantRequestDTO vDto : dto.getVariants()) {
                if (vDto.getStockQuantity() == null || vDto.getStockQuantity() < 0) {
                    throw new RuntimeException("Số lượng tồn kho không hợp lệ");
                }
                if (vDto.getVariantId() != null) {
                    product.getVariants().stream()
                            .filter(v -> v.getId().equals(vDto.getVariantId()))
                            .findFirst()
                            .ifPresent(v -> {
                                if (vDto.getSize() != null) v.setSize(vDto.getSize());
                                if (vDto.getColor() != null) v.setColor(vDto.getColor());
                                v.setStockQuantity(vDto.getStockQuantity());
                                if (dto.getPrice() != null) v.setPrice(dto.getPrice());
                            });
                } else {
                    ProductVariant variant = ProductVariant.builder()
                            .size(vDto.getSize())
                            .color(vDto.getColor())
                            .stockQuantity(vDto.getStockQuantity())
                            .price(dto.getPrice() != null
                                    ? dto.getPrice() : (product.getVariants().isEmpty()
                                    ? 0.0 : product.getVariants().get(0).getPrice()))
                            .product(product)
                            .build();
                    product.getVariants().add(variant);
                }
            }
        }
        
        productRepository.save(product);
        return getProductDetail(product.getId());
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Sản phẩm không tồn tại!");
        }

        try {
            // High-fidelity cleanup using a dedicated repository (SOLID)
            cleanupRepository.nuclearDelete(productId);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi hệ thống: Không thể xóa sản phẩm. Chi tiết: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAllCategories() {
        // Trả về DTO của các danh mục gốc (không có cha)
        List<Category> roots = categoryRepository.findByParentIsNull();
        return roots.stream()
                .map(cat -> CategoryResponseDTO.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .childCount(cat.getChildren() != null ? cat.getChildren().size() : 0)
                        .build())
                .collect(Collectors.toList());
    }
}


