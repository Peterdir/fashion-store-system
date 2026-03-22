package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {
}
