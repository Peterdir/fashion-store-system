package org.example.fashionstoresystem.service.product;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.CreateProductRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateProductRequestDTO;
import org.example.fashionstoresystem.dto.response.ProductDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.ProductSummaryResponseDTO;
import org.example.fashionstoresystem.entity.enums.ProductStatus;
import org.example.fashionstoresystem.entity.jpa.Product;
import org.example.fashionstoresystem.entity.jpa.ProductImage;
import org.example.fashionstoresystem.entity.jpa.ProductVariant;
import org.example.fashionstoresystem.repository.ProductRepository;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.stream.Collectors;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public Page<ProductSummaryResponseDTO> getProducts(String keyword, Pageable pageable) {
        Page<Product> productsPage;
        
        // Nếu keyword trống thì lấy tất cả, ngược lại thì tìm kiếm thông minh theo Tên hoặc Category
        if (keyword == null || keyword.trim().isEmpty()) {
            productsPage = productRepository.findAll(pageable);
        } else {
            productsPage = productRepository.findByNameOrCategoryContaining(keyword.trim(), pageable);
        }

        // Map Entity sang DTO
        return productsPage.map(product -> ProductSummaryResponseDTO.builder()
                .productId(product.getId())
                .name(product.getName())
                .price(product.getVariants().isEmpty() ? 0.0 : product.getVariants().get(0).getPrice())
                .category(product.getCategory())
                .status(product.getStatus())
                .primaryImageUrl(product.getImages().isEmpty() ? "/images/placeholder.png" : product.getImages().get(0).getUrl())
                .hoverImageUrl(product.getImages().size() > 1 ? product.getImages().get(1).getUrl() : (product.getImages().isEmpty() ? "/images/placeholder.png" : product.getImages().get(0).getUrl()))
                .build());
    }

    @Override
    public ProductDetailResponseDTO getProductDetail(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại hoặc đã bị ngừng kinh doanh!"));

        // Map chi tiết Entity (gồm cả các list phụ) sang DTO
        return ProductDetailResponseDTO.builder()
                .productId(product.getId())
                .name(product.getName())
                .price(product.getVariants().isEmpty() ? 0.0 : product.getVariants().get(0).getPrice())
                .minPrice(product.getVariants().isEmpty() ? 0.0 : product.getVariants().stream().mapToDouble(ProductVariant::getPrice).min().orElse(0.0))
                .category(product.getCategory())
                .categoryName(product.getCategory())
                .description(product.getDescription())
                .status(product.getStatus())
                .mainImage(product.getImages().isEmpty() ? "/images/placeholder.png" : product.getImages().get(0).getUrl())
                .hoverImage(product.getImages().size() > 1 ? product.getImages().get(1).getUrl() : (product.getImages().isEmpty() ? "/images/placeholder.png" : product.getImages().get(0).getUrl()))
                .images(product.getImages().stream()
                        .map(img -> ProductDetailResponseDTO.ProductImageDTO.builder()
                                .imageId(img.getId())
                                .url(img.getUrl())
                                .build())
                        .collect(Collectors.toList()))
                .variants(product.getVariants().stream()
                        .map(v -> ProductDetailResponseDTO.ProductVariantDTO.builder()
                                .variantId(v.getId())
                                .size(v.getSize())
                                .color(v.getColor())
                                .stockQuantity(v.getStockQuantity())
                                .build())
                        .collect(Collectors.toList()))
                .reviews(product.getReviews().stream()
                        .map(r -> ProductDetailResponseDTO.ReviewDTO.builder()
                                .reviewId(r.getId())
                                .rating(r.getRating())
                                .comment(r.getComment())
                                .reviewerName(r.getUser() != null ? r.getUser().getFullName() : "Anonymous")
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    @Transactional
    public ProductDetailResponseDTO createProduct(CreateProductRequestDTO dto) {
        if (dto.getPrice() == null || dto.getPrice() < 0) {
            throw new RuntimeException("Giá sản phẩm không hợp lệ");
        }
        Product product = Product.builder()
                .name(dto.getName())
                .category(dto.getCategory())
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
        if (dto.getCategory() != null) product.setCategory(dto.getCategory());
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
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));
        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return productRepository.findDistinctCategories();
    }
}
