package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndIsReadFalse(Long userId);

    void deleteAllByUserId(Long userId);
}
