package org.example.fashionstoresystem.service.product;

import org.example.fashionstoresystem.dto.response.ProductDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.ProductSummaryResponseDTO;

import java.util.List;

public interface ProductService {
    List<ProductSummaryResponseDTO> getProducts(String keyword);
    ProductDetailResponseDTO getProductDetail(Long productId);
}
