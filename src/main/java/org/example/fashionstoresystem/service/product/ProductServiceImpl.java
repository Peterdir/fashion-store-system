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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public List<ProductSummaryResponseDTO> getProducts(String keyword) {
        List<Product> products;
        
        // Nếu keyword trống thì lấy tất cả, ngược lại thì tìm kiếm
        if (keyword == null || keyword.trim().isEmpty()) {
            products = productRepository.findAll();
        } else {
            products = productRepository.findByNameContainingIgnoreCase(keyword.trim());
        }

        // Map Entity sang DTO
        return products.stream().map(product -> ProductSummaryResponseDTO.builder()
                .productId(product.getId())
                .name(product.getName())
                .price(product.getVariants().isEmpty() ? 0.0 : product.getVariants().get(0).getPrice())
                .category(product.getCategory())
                .status(product.getStatus())
                // .primaryImageUrl(TODO: Lấy ảnh chính từ list images của product nếu có)
                .build()).collect(Collectors.toList());
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
                .category(product.getCategory())
                .description(product.getDescription())
                .status(product.getStatus())
                // .images(...)
                // .variants(...)
                // .reviews(...)
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
}
