package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
}
