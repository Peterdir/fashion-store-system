package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}
