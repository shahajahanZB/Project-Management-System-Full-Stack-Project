package com.example.proman.iam.domain.service;

import com.example.proman.iam.domain.entity.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTService {

    private final long jwtExpirationMs = 108000000;
    private final SecretKey key;

    public JWTService(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String generateToken(UserPrincipal userPrincipal) {
        Map<String, Object> claims = new HashMap<>();

        List<String> roles = userPrincipal.getAuthorities().stream()
                .filter(a -> a.getAuthority().startsWith("ROLE_"))
                .map(a -> a.getAuthority())
                .toList();

        claims.put("roles", roles);
        claims.put("userId", userPrincipal.getUser().getId());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userPrincipal.getUser().getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key)
                .compact();
    }

    public String extractUserName(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String userName = extractUserName(token);
        return userName.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String generateConfirmToken(Long userId, int seconds) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("type", "CONFIRM")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + seconds * 1000L))
                .signWith(key)
                .compact();
    }
}
