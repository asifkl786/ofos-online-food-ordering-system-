package com.ofos.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog extends BaseEntity {
    @Column(nullable = false)
    private String adminEmail;
    private String adminRole;
    @Column(nullable = false)
    private String action;
    private String resource;
    @Column(nullable = false)
    private String httpMethod;
    @Column(nullable = false, length = 600)
    private String endpoint;
    private Integer responseStatus;
    private Boolean success;
    private String ipAddress;
    private String userAgent;
    @Column(length = 1000)
    private String errorMessage;
}
