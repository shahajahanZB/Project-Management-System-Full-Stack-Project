package com.example.proman.iam.domain.repository;

import com.example.proman.iam.domain.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    RefreshToken findByUserId(Long userId);
}