package com.ofos.controller;

import com.ofos.dto.request.ChangePasswordRequest;
import com.ofos.dto.request.UserRegistrationRequest;
import com.ofos.dto.request.UserUpdateRequest;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.UserResponse;
import com.ofos.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {
    
    private final UserService userService;
    
    @PostMapping("/register")
   // @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        log.info("REST request to register user");
        UserResponse response = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
   // @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse> getUserById(@PathVariable Long id) {
        log.info("REST request to get user by id: {}", id);
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User found", response));
    }
    
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
   // @Operation(summary = "Get user by email (Admin only)")
    public ResponseEntity<ApiResponse> getUserByEmail(@PathVariable String email) {
        log.info("REST request to get user by email: {}", email);
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("User found", response));
    }
    
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
   // @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get current user profile");
        UserResponse response = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User profile found", response));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
   // @Operation(summary = "Update user")
    public ResponseEntity<ApiResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update user with id: {}", id);
        
        // Check if user is updating their own profile or is admin
        UserResponse currentUser = userService.getUserByEmail(userDetails.getUsername());
        if (!currentUser.getId().equals(id) && !userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only update your own profile"));
        }
        
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
    }
    
    @PostMapping("/{id}/change-password")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    //@Operation(summary = "Change user password")
    public ResponseEntity<ApiResponse> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to change password for user id: {}", id);
        
        UserResponse currentUser = userService.getUserByEmail(userDetails.getUsername());
        if (!currentUser.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only change your own password"));
        }
        
        userService.changePassword(id, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
   // @Operation(summary = "Delete user (Admin only)")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        log.info("REST request to delete user with id: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
    
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
   // @Operation(summary = "Deactivate user (Admin only)")
    public ResponseEntity<ApiResponse> deactivateUser(@PathVariable Long id) {
        log.info("REST request to deactivate user with id: {}", id);
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated successfully", null));
    }
    
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    //@Operation(summary = "Activate user (Admin only)")
    public ResponseEntity<ApiResponse> activateUser(@PathVariable Long id) {
        log.info("REST request to activate user with id: {}", id);
        userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success("User activated successfully", null));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
   // @Operation(summary = "Get all users (Admin only)")
    public ResponseEntity<ApiResponse> getAllUsers(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get all users");
        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Users found", users));
    }
    
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
   // @Operation(summary = "Get users by role (Admin only)")
    public ResponseEntity<ApiResponse> getUsersByRole(
            @PathVariable String role,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get users by role: {}", role);
        Page<UserResponse> users = userService.getUsersByRole(role, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users found", users));
    }
    
    @GetMapping("/check-email/{email}")
   // @Operation(summary = "Check if email exists")
    public ResponseEntity<ApiResponse> checkEmailExists(@PathVariable String email) {
        log.info("REST request to check email exists: {}", email);
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Email check completed", exists));
    }
}
