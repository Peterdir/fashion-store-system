package org.example.fashionstoresystem.service.product;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.ProductDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.ProductSummaryResponseDTO;
import org.example.fashionstoresystem.entity.jpa.Product;
import org.example.fashionstoresystem.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public List<ProductSummaryResponseDTO> getProducts(String keyword) {
        List<Product> products;
        
        // Theo SD09: Nếu keyword trống thì lấy tất cả, ngược lại thì tìm kiếm
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
}
