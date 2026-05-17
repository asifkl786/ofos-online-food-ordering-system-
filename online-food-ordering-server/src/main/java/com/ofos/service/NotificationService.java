package com.ofos.service;

import com.ofos.dto.request.BulkNotificationRequest;
import com.ofos.dto.request.SendNotificationRequest;
import com.ofos.dto.request.UpdatePreferenceRequest;
import com.ofos.dto.response.NotificationPreferenceResponse;
import com.ofos.dto.response.NotificationResponse;
import com.ofos.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    
    // Send Notifications
    NotificationResponse sendNotification(SendNotificationRequest request);

    NotificationResponse createInAppNotification(Long userId, String title, String message, NotificationType type, Long orderId);
    
    void sendOrderConfirmation(Long orderId);
    
    void sendOrderStatusUpdate(Long orderId, String oldStatus, String newStatus);
    
    void sendOrderDelivered(Long orderId);
    
    void sendOrderCancelled(Long orderId, String reason);
    
    void sendPaymentSuccess(Long orderId);
    
    void sendPaymentFailed(Long orderId, String reason);
    
    void sendWelcomeEmail(String userEmail, String userName);
    
    void sendOtpEmail(String email, String otp);
    
    void sendOtpSms(String phoneNumber, String otp);
    
    // Bulk Notifications
    void sendBulkNotification(BulkNotificationRequest request);
    
    // User Notifications
    Page<NotificationResponse> getUserNotifications(String userEmail, Pageable pageable);
    
    NotificationResponse getNotificationById(Long notificationId);
    
    void markAsRead(Long notificationId, String userEmail);
    
    void markAllAsRead(String userEmail);

    void deleteNotification(Long notificationId, String userEmail);
    
    Long getUnreadCount(String userEmail);
    
    // Preferences
    NotificationPreferenceResponse getPreferences(String userEmail);
    
    NotificationPreferenceResponse updatePreferences(UpdatePreferenceRequest request, String userEmail);
    
    // System
    void processPendingNotifications();
    
    void deleteOldNotifications(Integer daysOld);
}
