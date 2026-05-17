package com.ofos.service;

import com.ofos.dto.request.ChangePasswordRequest;
import com.ofos.dto.request.UserRegistrationRequest;
import com.ofos.dto.request.UserUpdateRequest;
import com.ofos.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    
    UserResponse registerUser(UserRegistrationRequest request);
    
    UserResponse getUserById(Long id);
    
    UserResponse getUserByEmail(String email);
    
    UserResponse updateUser(Long id, UserUpdateRequest request);
    
    void changePassword(Long userId, ChangePasswordRequest request);
    
    void deactivateUser(Long userId);
    
    void activateUser(Long userId);
    
    Page<UserResponse> getAllUsers(Pageable pageable);
    
    Page<UserResponse> getUsersByRole(String role, Pageable pageable);
    
    void deleteUser(Long id);
    
    boolean existsByEmail(String email);
}
