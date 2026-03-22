package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
}
