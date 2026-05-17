package com.ofos.service;

import com.ofos.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final JwtUtil jwtUtil;
    private final Map<String, Long> invalidatedTokens = new ConcurrentHashMap<>();

    public void invalidate(String token) {
        if (token == null || token.isBlank()) {
            return;
        }

        String normalizedToken = normalize(token);
        long ttl = jwtUtil.extractExpiration(normalizedToken).getTime() - System.currentTimeMillis();
        if (ttl > 0) {
            // Store the token until its natural expiry so logout immediately blocks protected APIs.
            invalidatedTokens.put(normalizedToken, System.currentTimeMillis() + ttl);
        }
    }

    public boolean isInvalidated(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        String normalizedToken = normalize(token);
        Long expiresAt = invalidatedTokens.get(normalizedToken);
        if (expiresAt == null) {
            return false;
        }

        if (expiresAt <= System.currentTimeMillis()) {
            // Remove expired blacklist entries during normal reads to keep memory usage bounded.
            invalidatedTokens.remove(normalizedToken);
            return false;
        }

        return true;
    }

    private String normalize(String token) {
        return token.startsWith("Bearer ") ? token.substring(7) : token;
    }
}
