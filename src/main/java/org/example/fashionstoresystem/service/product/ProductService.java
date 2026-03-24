package org.example.fashionstoresystem.service.product;

import org.example.fashionstoresystem.dto.request.CreateProductRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateProductRequestDTO;
import org.example.fashionstoresystem.dto.response.ProductDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.ProductSummaryResponseDTO;

import java.util.List;

public interface ProductService {
    List<ProductSummaryResponseDTO> getProducts(String keyword);
    ProductDetailResponseDTO getProductDetail(Long productId);

    // Admin
    ProductDetailResponseDTO createProduct(CreateProductRequestDTO dto);

    ProductDetailResponseDTO updateProduct(Long productId, UpdateProductRequestDTO dto);

    void deleteProduct(Long productId);
}
