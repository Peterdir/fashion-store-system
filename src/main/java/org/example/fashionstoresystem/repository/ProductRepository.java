package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.example.fashionstoresystem.entity.enums.ProductStatus;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Lấy các sản phẩm có trạng thái còn bán
    List<Product> findByStatus(ProductStatus status);

    // Tìm sản phẩm chứa keyword trong tên hoặc danh mục
    @Query("SELECT p FROM Product p WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND p.status = 'ACTIVE'")
    Page<Product> findByNameOrCategoryContaining(String keyword, Pageable pageable);

    // Tìm theo keyword + lọc trạng thái + phân trang
    Page<Product> findByNameContainingIgnoreCaseAndStatus(String keyword, ProductStatus status, Pageable pageable);

    // Lấy danh sách các danh mục duy nhất
    @Query("SELECT DISTINCT p.category FROM Product p")
    List<String> findDistinctCategories();
}
