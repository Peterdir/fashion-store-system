package org.example.fashionstoresystem.service.notification;

import org.example.fashionstoresystem.entity.jpa.Notification;
import org.example.fashionstoresystem.entity.jpa.User;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, String title, String content, String type, Long relatedId);
    List<Notification> getMyNotifications(Long userId);
    long countUnread(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}
