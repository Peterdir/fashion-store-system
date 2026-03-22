package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
