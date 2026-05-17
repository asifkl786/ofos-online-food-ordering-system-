package com.ofos.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private String channel;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
    private Long orderId;
    private String orderNumber;
}