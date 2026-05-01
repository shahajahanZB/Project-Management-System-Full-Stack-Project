package com.example.proman.iam.domain.service;


import com.example.proman.iam.domain.entity.RefreshToken;
import com.example.proman.iam.domain.repository.RefreshTokenRepository;
import com.example.proman.iam.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {
//    @Value("${jwt.refreshExpirationMs}")
    private Long refreshTokenDurationMs = 108000000L;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public RefreshTokenService(RefreshTokenRepository repo, UserRepository userRepo) {
        this.refreshTokenRepository = repo;
        this.userRepository = userRepo;
    }

    public RefreshToken createRefreshToken(Long userId) {
        RefreshToken existing = refreshTokenRepository.findByUserId(userId);

        if (existing != null) {
            existing.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
            existing.setToken(UUID.randomUUID().toString());
            return refreshTokenRepository.save(existing);
        }

        RefreshToken token = new RefreshToken();
        token.setUser(userRepository.findById(userId).orElseThrow());
        token.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        token.setToken(UUID.randomUUID().toString());
        return refreshTokenRepository.save(token);
    }

    public boolean isTokenExpired(RefreshToken token) {
        return token.getExpiryDate().isBefore(Instant.now());
    }
}
