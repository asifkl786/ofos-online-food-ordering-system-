package com.ofos.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuditLogResponse {
    private Long id;
    private String adminEmail;
    private String adminRole;
    private String action;
    private String resource;
    private String httpMethod;
    private String endpoint;
    private Integer responseStatus;
    private Boolean success;
    private String ipAddress;
    private String userAgent;
    private String errorMessage;
    private LocalDateTime createdAt;
}
