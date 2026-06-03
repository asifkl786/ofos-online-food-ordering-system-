package com.ofos.controller;

import com.ofos.dto.request.BulkNotificationRequest;
import com.ofos.dto.request.SendNotificationRequest;
import com.ofos.dto.request.UpdatePreferenceRequest;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.NotificationPreferenceResponse;
import com.ofos.dto.response.NotificationResponse;
import com.ofos.entity.User;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.UserRepository;
import com.ofos.service.NotificationService;
import com.ofos.service.NotificationStreamService;
import com.ofos.service.TokenBlacklistService;
import com.ofos.service.impl.CustomUserDetailsService;
import com.ofos.utils.JwtUtil;
import io.jsonwebtoken.JwtException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notification Management", description = "APIs for managing notifications")
public class NotificationController {
    
    private final NotificationService notificationService;
    private final NotificationStreamService notificationStreamService;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;
    
    // ==================== Send Notifications ====================
    
    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESTAURANT_OWNER')")
    @Operation(summary = "Send notification (Admin/Owner only)")
    public ResponseEntity<ApiResponse> sendNotification(@Valid @RequestBody SendNotificationRequest request) {
        log.info("REST request to send notification");
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notification sent", response));
    }
    
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Send bulk notification (Admin only)")
    public ResponseEntity<ApiResponse> sendBulkNotification(@Valid @RequestBody BulkNotificationRequest request) {
        log.info("REST request to send bulk notification");
        notificationService.sendBulkNotification(request);
        return ResponseEntity.ok(ApiResponse.success("Bulk notification sent", null));
    }
    
    // ==================== User Notifications ====================
    
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Get user notifications")
    public ResponseEntity<ApiResponse> getUserNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get user notifications");
        Page<NotificationResponse> notifications = notificationService.getUserNotifications(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Notifications found", notifications));
    }
    
    @GetMapping("/unread/count")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get unread count");
        Long count = notificationService.getUnreadCount(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Unread count", count));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Open real-time notification stream")
    public SseEmitter streamNotifications(@RequestParam String token) {
        log.info("REST request to open notification stream");

        // EventSource cannot send Authorization headers in the browser, so this stream validates the JWT query token explicitly.
        String normalizedToken = token.startsWith("Bearer ") ? token.substring(7) : token;
        if (tokenBlacklistService.isInvalidated(normalizedToken)) {
            return invalidTokenStream();
        }

        String email;
        try {
            email = jwtUtil.extractUsername(normalizedToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            if (!jwtUtil.validateToken(normalizedToken, userDetails)) {
                return invalidTokenStream();
            }
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("Rejecting notification stream with invalid JWT");
            return invalidTokenStream();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationStreamService.subscribe(user.getId());
    }

    private SseEmitter invalidTokenStream() {
        SseEmitter emitter = new SseEmitter(0L);
        try {
            emitter.send(SseEmitter.event().name("auth-error").data("Invalid or expired token"));
        } catch (Exception ignored) {
        } finally {
            emitter.complete();
        }
        return emitter;
    }
    
    @GetMapping("/{notificationId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Get notification by ID")
    public ResponseEntity<ApiResponse> getNotificationById(@PathVariable Long notificationId) {
        log.info("REST request to get notification: {}", notificationId);
        NotificationResponse response = notificationService.getNotificationById(notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification found", response));
    }
    
    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse> markAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to mark notification as read: {}", notificationId);
        notificationService.markAsRead(notificationId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }
    
    @PatchMapping("/read-all")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to mark all notifications as read");
        notificationService.markAllAsRead(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Delete notification")
    public ResponseEntity<ApiResponse> deleteNotification(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to delete notification: {}", notificationId);
        notificationService.deleteNotification(notificationId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }
    
    // ==================== Preferences ====================
    
    @GetMapping("/preferences")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Get notification preferences")
    public ResponseEntity<ApiResponse> getPreferences(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get notification preferences");
        NotificationPreferenceResponse response = notificationService.getPreferences(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Preferences found", response));
    }
    
    @PutMapping("/preferences")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Update notification preferences")
    public ResponseEntity<ApiResponse> updatePreferences(
            @Valid @RequestBody UpdatePreferenceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update notification preferences");
        NotificationPreferenceResponse response = notificationService.updatePreferences(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Preferences updated", response));
    }
}
