package org.example.fashionstoresystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.ProductDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.ProductSummaryResponseDTO;
import org.example.fashionstoresystem.service.product.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // LẤY DANH SÁCH SẢN PHẨM (SEARCH / FILTER)
    @GetMapping
    public ResponseEntity<Page<ProductSummaryResponseDTO>> getProducts(
            @RequestParam(required = false) String keyword,
            Pageable pageable
    ) {

        Page<ProductSummaryResponseDTO> response = productService.getProducts(keyword, pageable);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // XEM CHI TIẾT SẢN PHẨM
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDetailResponseDTO> getProductDetail(
            @PathVariable Long productId
    ) {

        ProductDetailResponseDTO response = productService.getProductDetail(productId);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
