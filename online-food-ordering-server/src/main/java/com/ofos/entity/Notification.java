package com.ofos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, length = 2000)
    private String message;
    
    @Enumerated(EnumType.STRING)
    private NotificationType type; // ORDER, PAYMENT, PROMOTION, SYSTEM
    
    @Enumerated(EnumType.STRING)
    private NotificationChannel channel; // EMAIL, SMS, PUSH, IN_APP
    
    @Column(nullable = false)
    private String recipient; // email or phone number
    
    private String recipientName;
    
    private Boolean isSent = false;
    
    private Boolean isRead = false;
    
    private LocalDateTime sentAt;
    
    private LocalDateTime readAt;
    
    private String errorMessage;
    
    private Integer retryCount = 0;
    
    private String templateName;
    
    private String additionalData; // JSON data for dynamic content
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}