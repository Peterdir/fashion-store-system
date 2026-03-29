package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.RecentlyViewedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecentlyViewedItemRepository extends JpaRepository<RecentlyViewedItem, Long> {
    
    List<RecentlyViewedItem> findTop10ByUserIdOrderByViewedAtDesc(Long userId);
    
    Optional<RecentlyViewedItem> findByUserIdAndProductId(Long userId, Long productId);
    
    void deleteByUserId(Long userId);
}
