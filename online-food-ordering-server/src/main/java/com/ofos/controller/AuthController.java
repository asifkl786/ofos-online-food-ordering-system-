package com.ofos.controller;

import com.ofos.dto.request.LoginRequest;
import com.ofos.dto.request.LogoutRequest;
import com.ofos.dto.request.RefreshTokenRequest;
import com.ofos.dto.request.UserRegistrationRequest;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.AuthResponse;
import com.ofos.dto.response.JwtResponse;
import com.ofos.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication & Authorization", description = "APIs for user authentication and authorization")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody UserRegistrationRequest request) {
        log.info("REST request to register user: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }
    
    @PostMapping("/admin/register")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new admin user")
    public ResponseEntity<ApiResponse> registerAdmin(@Valid @RequestBody UserRegistrationRequest request) {
        log.info("REST request by admin to create another admin user: {}", request.getEmail());
        // Admin dashboard creation must always create an ADMIN, even if the client sends a different role.
        request.setRole("ADMIN");
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Admin user registered successfully", response));
    }
    
    @PostMapping("/login")
    @Operation(summary = "Authenticate user and generate tokens")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Recived REST request to login user: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("REST request to refresh token");
        JwtResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }
    
    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate token")
    public ResponseEntity<ApiResponse> logout(@Valid @RequestBody LogoutRequest request) {
        log.info("REST request to logout user");
        authService.logout(request);
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }
    
    @GetMapping("/validate")
    @Operation(summary = "Validate JWT token")
    public ResponseEntity<ApiResponse> validateToken(@RequestHeader("Authorization") String token) {
        log.info("REST request to validate token");
        
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        boolean isValid = authService.isTokenValid(token);
        if (isValid) {
            return ResponseEntity.ok(ApiResponse.success("Token is valid", null));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Token is invalid or expired"));
        }
    }
}



