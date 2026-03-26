package org.example.fashionstoresystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.CreateProductRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateProductRequestDTO;
import org.example.fashionstoresystem.dto.response.ProductDetailResponseDTO;
import org.example.fashionstoresystem.service.product.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    // THÊM SẢN PHẨM
    @PostMapping
    public ResponseEntity<ProductDetailResponseDTO> createProduct(
            @Valid @RequestBody CreateProductRequestDTO dto
    ) {

        ProductDetailResponseDTO response = productService.createProduct(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // CẬP NHẬT SẢN PHẨM
    @PutMapping("/{productId}")
    public ResponseEntity<ProductDetailResponseDTO> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody UpdateProductRequestDTO dto
    ) {

        ProductDetailResponseDTO response = productService.updateProduct(productId, dto);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // XÓA SẢN PHẨM
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long productId
    ) {

        productService.deleteProduct(productId);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
