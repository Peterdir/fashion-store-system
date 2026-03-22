package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
