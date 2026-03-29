package org.example.fashionstoresystem.service.recently_viewed;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.RecentlyViewedResponseDTO;
import org.example.fashionstoresystem.entity.jpa.Product;
import org.example.fashionstoresystem.entity.jpa.RecentlyViewedItem;
import org.example.fashionstoresystem.entity.jpa.User;
import org.example.fashionstoresystem.repository.RecentlyViewedItemRepository;
import org.example.fashionstoresystem.repository.ProductRepository;
import org.example.fashionstoresystem.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RecentlyViewedServiceImpl implements RecentlyViewedService {

    private final RecentlyViewedItemRepository recentlyViewedItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void trackView(Long userId, Long productId) {
        Optional<RecentlyViewedItem> existing = recentlyViewedItemRepository.findByUserIdAndProductId(userId, productId);

        if (existing.isPresent()) {
            RecentlyViewedItem item = existing.get();
            item.setViewedAt(LocalDateTime.now());
            recentlyViewedItemRepository.save(item);
        } else {
            User user = userRepository.findById(userId).orElse(null);
            Product product = productRepository.findById(productId).orElse(null);

            if (user != null && product != null) {
                RecentlyViewedItem newItem = RecentlyViewedItem.builder()
                        .user(user)
                        .product(product)
                        .viewedAt(LocalDateTime.now())
                        .build();
                recentlyViewedItemRepository.save(newItem);
            }
        }
    }

    @Override
    @Transactional
    public void trackView(String userEmail, Long productId) {
        userRepository.findByEmail(userEmail).ifPresent(user -> {
            trackView(user.getId(), productId);
        });
    }

    @Override
    @Transactional
    public void clearHistory(Long userId) {
        recentlyViewedItemRepository.deleteByUserId(userId);
    }

    @Override
    @Transactional
    public void deleteItems(Long userId, List<Long> productIds) {
        recentlyViewedItemRepository.deleteByUserIdAndProductIdIn(userId, productIds);
    }

    @Override
    public List<RecentlyViewedResponseDTO> getRecentlyViewed(Long userId) {
        List<RecentlyViewedItem> items = recentlyViewedItemRepository.findTop10ByUserIdOrderByViewedAtDesc(userId);

        return items.stream()
                .map(item -> {
                    Product product = item.getProduct();
                    Double price = product.getVariants().isEmpty() ? 0.0 : product.getVariants().get(0).getPrice();
                    String imageUrl = product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl();

                    return RecentlyViewedResponseDTO.builder()
                            .id(product.getId())
                            .productName(product.getName())
                            .productPrice(price)
                            .originalPrice(price) // Placeholder: assuming no discount for now
                            .discountPercent(0)   // Placeholder
                            .brandName(product.getCategory() != null ? product.getCategory().getName() : "H&Y")
                            .imageUrl(imageUrl)
                            .inStock(product.getStatus() == org.example.fashionstoresystem.entity.enums.ProductStatus.ACTIVE)
                            .build();
                })
                .toList();
    }
}
