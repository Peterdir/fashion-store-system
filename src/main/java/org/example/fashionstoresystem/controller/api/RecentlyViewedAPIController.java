package org.example.fashionstoresystem.controller.api;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.service.recently_viewed.RecentlyViewedService;
import org.example.fashionstoresystem.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recently-viewed")
@RequiredArgsConstructor
public class RecentlyViewedAPIController {

    private final RecentlyViewedService recentlyViewedService;

    @DeleteMapping
    public ResponseEntity<Void> deleteItems(
            @RequestParam List<Long> productIds) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        recentlyViewedService.deleteItems(userId, productIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearHistory() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        recentlyViewedService.clearHistory(userId);
        return ResponseEntity.ok().build();
    }
}
