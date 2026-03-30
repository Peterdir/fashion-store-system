package org.example.fashionstoresystem.service.product;

import org.example.fashionstoresystem.dto.request.CreateProductRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateProductRequestDTO;
import org.example.fashionstoresystem.dto.response.CategoryResponseDTO;
import org.example.fashionstoresystem.dto.response.ProductDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.ProductSummaryResponseDTO;

import org.example.fashionstoresystem.entity.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    Page<ProductSummaryResponseDTO> getProducts(String keyword, Pageable pageable);

    // Dành cho Admin: Lấy danh sách sản phẩm (hỗ trợ lọc theo trạng thái và tìm kiếm)
    Page<ProductSummaryResponseDTO> getAdminProducts(String keyword, ProductStatus status, Pageable pageable);

    ProductDetailResponseDTO getProductDetail(Long productId);
    
    // Lấy sản phẩm liên quan (cùng danh mục)
    List<ProductSummaryResponseDTO> getRelatedProducts(Long productId, int limit);

    // Admin
    ProductDetailResponseDTO createProduct(CreateProductRequestDTO dto);

    ProductDetailResponseDTO updateProduct(Long productId, UpdateProductRequestDTO dto);

    void deleteProduct(Long productId);

    List<CategoryResponseDTO> getAllCategories();
}
