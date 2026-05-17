package com.ofos.dto.request;

import com.ofos.entity.NotificationChannel;
import com.ofos.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BulkNotificationRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    @NotNull(message = "Notification type is required")
    private NotificationType type;
    
    @NotNull(message = "Channel is required")
    private NotificationChannel channel;
    
    private List<String> recipients;
    
    private String userRole; // CUSTOMER, RESTAURANT_OWNER, DELIVERY_PARTNER, ALL
}