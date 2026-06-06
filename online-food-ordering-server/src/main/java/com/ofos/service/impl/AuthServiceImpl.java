package com.ofos.service.impl;

import com.ofos.dto.request.ForgotPasswordRequest;
import com.ofos.dto.request.LoginRequest;
import com.ofos.dto.request.LogoutRequest;
import com.ofos.dto.request.RefreshTokenRequest;
import com.ofos.dto.request.ResetPasswordRequest;
import com.ofos.dto.request.UserRegistrationRequest;
import com.ofos.dto.response.AuthResponse;
import com.ofos.dto.response.JwtResponse;
import com.ofos.dto.response.UserResponse;
import com.ofos.entity.PasswordResetToken;
import com.ofos.entity.User;
import com.ofos.entity.UserRole;
import com.ofos.entity.Wallet;
import com.ofos.exception.BusinessException;
import com.ofos.repository.PasswordResetTokenRepository;
import com.ofos.repository.UserRepository;
import com.ofos.repository.WalletRepository;
import com.ofos.service.AuthService;
import com.ofos.service.TokenBlacklistService;
import com.ofos.utils.EmailValidationUtil;
import com.ofos.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;
    private final JavaMailSender javaMailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${notification.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${spring.mail.from:no-reply@example.com}")
    private String mailFrom;

    @Value("${app.password-reset.expiry-minutes:30}")
    private long passwordResetExpiryMinutes;

    @Value("${app.password-reset.expose-token:true}")
    private boolean exposePasswordResetToken;
    
    @Override
    @Transactional
    public AuthResponse register(UserRegistrationRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());
        EmailValidationUtil.rejectKnownDomainTypos(request.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already registered: " + request.getEmail());
        }
        
        // Check if phone number already exists
        if (request.getPhoneNumber() != null && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BusinessException("Phone number already registered: " + request.getPhoneNumber());
        }
        
        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        
        // Admin registration is guarded: only the first setup admin or an existing admin can create admin accounts.
        UserRole requestedRole = resolveRegistrationRole(request.getRole());
        user.setRole(requestedRole);
        
        user.setIsActive(true);
       // user.setIsEmailVerified(false);
       // user.setIsPhoneVerified(false);
        user.setCreatedAt(LocalDateTime.now());
        
        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with id: {}", savedUser.getId());
        
        // Create wallet for user
        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        wallet.setBalance(java.math.BigDecimal.ZERO);
        walletRepository.save(wallet);
        
        // Generate tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);
        
        // Build user response
        UserResponse userResponse = buildUserResponse(savedUser);
        
        return AuthResponse.builder()
                .success(true)
                .message("User registered successfully")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpiration())
                .user(userResponse)
                .build();
    }
    
    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Login request for user: {}", request.getEmail());
        
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        // Set authentication in context
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Load user details
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        
        // Generate tokens
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);
        
        // Get user from database
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("User not found"));
        
        // Update last login time
       // user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Build user response
        UserResponse userResponse = buildUserResponse(user);
        
        log.info("User logged in successfully: {}", request.getEmail());
        
        return AuthResponse.builder()
                .success(true)
                .message("Login successful")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpiration())
                .user(userResponse)
                .build();
    }
    
    @Override
    public JwtResponse refreshToken(RefreshTokenRequest request) {
        log.info("Refreshing token");
        
        String refreshToken = request.getRefreshToken();
        
        // Validate refresh token
        String username = jwtUtil.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        
        if (!jwtUtil.validateToken(refreshToken, userDetails)) {
            throw new BusinessException("Invalid or expired refresh token");
        }
        
        // Generate new access token
        String newAccessToken = jwtUtil.generateToken(userDetails);
        String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);
        
        return JwtResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpiration())
                .refreshExpiresIn(jwtUtil.getExpiration())
                .build();
    }
    
    @Override
    public void logout(LogoutRequest request) {
        log.info("Logging out user");
        
        String token = request.getAccessToken();

        // Logout must block the same JWT on every protected endpoint, not only on token validation calls.
        tokenBlacklistService.invalidate(token);
        log.debug("Token invalidated successfully");
        
        // Clear security context
        SecurityContextHolder.clearContext();
    }

    @Override
    @Transactional
    public Map<String, Object> requestPasswordReset(ForgotPasswordRequest request) {
        Map<String, Object> response = new HashMap<>();

        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUser(user);

            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(token);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(passwordResetExpiryMinutes));
            resetToken.setUsed(false);
            passwordResetTokenRepository.save(resetToken);

            String resetUrl = buildResetUrl(token);
            boolean emailSent = sendPasswordResetEmail(user, resetUrl);
            response.put("emailSent", emailSent);
            response.put("expiresInMinutes", passwordResetExpiryMinutes);

            if (exposePasswordResetToken || !emailSent) {
                response.put("resetToken", token);
                response.put("resetUrl", resetUrl);
            }
        });

        return response;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUsedFalse(request.getToken())
                .orElseThrow(() -> new BusinessException("Invalid or expired reset link"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            resetToken.setUsed(true);
            passwordResetTokenRepository.save(resetToken);
            throw new BusinessException("Reset link has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        log.info("Password reset successfully for user: {}", user.getEmail());
    }
    
    @Override
    public void validateToken(String token) {
        log.debug("Validating token");
        
        // Blacklisted tokens are rejected after logout even if their JWT signature is still valid.
        if (tokenBlacklistService.isInvalidated(token)) {
            throw new BusinessException("Token has been invalidated");
        }
        
        // Extract username
        String username = jwtUtil.extractUsername(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        
        // Validate token
        if (!jwtUtil.validateToken(token, userDetails)) {
            throw new BusinessException("Invalid or expired token");
        }
    }
    
    @Override
    public boolean isTokenValid(String token) {
        try {
            validateToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String buildResetUrl(String token) {
        String baseUrl = frontendUrl == null || frontendUrl.isBlank() ? "http://localhost:5173" : frontendUrl;
        return baseUrl.replaceAll("/+$", "") + "/reset-password/" + token;
    }

    private boolean sendPasswordResetEmail(User user, String resetUrl) {
        if (!emailEnabled) {
            log.info("Email is disabled. Password reset link generated for user: {}", user.getEmail());
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(user.getEmail());
            message.setSubject("Reset your Online Food password");
            message.setText("Hello " + user.getFirstName() + ",\n\n"
                    + "Use this link to reset your password:\n" + resetUrl + "\n\n"
                    + "This link will expire in " + passwordResetExpiryMinutes + " minutes.\n\n"
                    + "If you did not request this, you can ignore this email.");
            javaMailSender.send(message);
            return true;
        } catch (Exception e) {
            log.warn("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
            return false;
        }
    }
    
    private UserRole resolveRegistrationRole(String requestedRole) {
        try {
            UserRole role = UserRole.valueOf((requestedRole == null ? "CUSTOMER" : requestedRole).toUpperCase());
            if (role == UserRole.ADMIN && hasExistingAdmin() && !isCurrentUserAdmin()) {
                throw new BusinessException("Admin accounts can only be created by an existing admin");
            }
            return role;
        } catch (IllegalArgumentException e) {
            return UserRole.CUSTOMER;
        }
    }

    private boolean hasExistingAdmin() {
        // Allows a clean database to bootstrap its first admin while blocking public admin signup later.
        return userRepository.existsByRole(UserRole.ADMIN);
    }

    private boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
    private UserResponse buildUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRole().toString());
        response.setProfileImageUrl(user.getProfileImageUrl());
       // response.setIsEmailVerified(user.getIsEmailVerified());
        response.setIsActive(user.getIsActive());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}

