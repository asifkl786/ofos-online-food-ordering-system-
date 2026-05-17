package com.ofos.dto.request;

import com.ofos.entity.NotificationChannel;
import com.ofos.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendNotificationRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    @NotNull(message = "Notification type is required")
    private NotificationType type;
    
    @NotNull(message = "Channel is required")
    private NotificationChannel channel;
    
    @NotBlank(message = "Recipient is required")
    private String recipient;
    
    private String recipientName;
    
    private Long userId;
    
    private Long orderId;
    
    private String templateName;
    
    private String additionalData;
}