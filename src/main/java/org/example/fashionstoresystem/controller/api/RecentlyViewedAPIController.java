package org.example.fashionstoresystem.controller.api;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.service.recently_viewed.RecentlyViewedService;
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
            @RequestParam Long userId,
            @RequestParam List<Long> productIds) {
        recentlyViewedService.deleteItems(userId, productIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearHistory(@RequestParam Long userId) {
        recentlyViewedService.clearHistory(userId);
        return ResponseEntity.ok().build();
    }
}
