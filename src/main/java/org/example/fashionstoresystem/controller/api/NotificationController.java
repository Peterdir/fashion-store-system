package org.example.fashionstoresystem.controller.api;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.NotificationResponseDTO;
import org.example.fashionstoresystem.service.notification.NotificationService;
import org.example.fashionstoresystem.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getMyNotifications() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        List<NotificationResponseDTO> response = notificationService.getMyNotifications(userId).stream()
                .map(n -> NotificationResponseDTO.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .content(n.getContent())
                        .type(n.getType())
                        .isRead(n.isRead())
                        .relatedId(n.getRelatedId())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(notificationService.countUnread(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<MessageResponseDTO> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new MessageResponseDTO("Đã đánh dấu đã đọc"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<MessageResponseDTO> markAllAsRead() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(new MessageResponseDTO("Đã đánh dấu tất cả là đã đọc"));
    }
}
