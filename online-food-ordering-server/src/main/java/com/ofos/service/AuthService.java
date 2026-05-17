package com.ofos.service;

import com.ofos.dto.request.LoginRequest;
import com.ofos.dto.request.LogoutRequest;
import com.ofos.dto.request.RefreshTokenRequest;
import com.ofos.dto.request.UserRegistrationRequest;
import com.ofos.dto.response.AuthResponse;
import com.ofos.dto.response.JwtResponse;

public interface AuthService {
    
    AuthResponse register(UserRegistrationRequest request);
    
    AuthResponse login(LoginRequest request);
    
    JwtResponse refreshToken(RefreshTokenRequest request);
    
    void logout(LogoutRequest request);
    
    void validateToken(String token);
    
    boolean isTokenValid(String token);
}
