package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
}
