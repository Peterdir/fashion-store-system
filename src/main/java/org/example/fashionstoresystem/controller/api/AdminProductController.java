package org.example.fashionstoresystem.controller.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.CreateProductRequestDTO;
import org.example.fashionstoresystem.dto.request.UpdateProductRequestDTO;
import org.example.fashionstoresystem.dto.response.ProductDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.ProductSummaryResponseDTO;
import org.example.fashionstoresystem.entity.enums.ProductStatus;
import org.example.fashionstoresystem.service.product.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    // LẤY DANH SÁCH SẢN PHẨM CHO ADMIN (CÓ LỌC STATUS VÀ TỪ KHÓA)
    @GetMapping
    public ResponseEntity<Page<ProductSummaryResponseDTO>> getAdminProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ProductStatus status,
            Pageable pageable
    ) {
        Page<ProductSummaryResponseDTO> response =
                productService.getAdminProducts(keyword, status, pageable);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

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
