package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.example.fashionstoresystem.entity.enums.ProductStatus;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Lấy các sản phẩm có trạng thái còn bán
    List<Product> findByStatus(ProductStatus status);

    // Tìm sản phẩm chứa keyword không phân biệt hoa thường
    List<Product> findByNameContainingIgnoreCase(String keyword);

    // Tìm theo keyword + lọc trạng thái + phân trang
    Page<Product> findByNameContainingIgnoreCaseAndStatus(String keyword, ProductStatus status, Pageable pageable);
}
