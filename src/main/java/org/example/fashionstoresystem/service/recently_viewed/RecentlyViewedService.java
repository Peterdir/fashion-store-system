package org.example.fashionstoresystem.service.recently_viewed;

import org.example.fashionstoresystem.dto.response.RecentlyViewedResponseDTO;

import java.util.List;

public interface RecentlyViewedService {
    void trackView(Long userId, Long productId);
    void trackView(String userEmail, Long productId);
    List<RecentlyViewedResponseDTO> getRecentlyViewed(Long userId);
    void clearHistory(Long userId);
    void deleteItems(Long userId, List<Long> productIds);
}
