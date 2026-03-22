package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
}
