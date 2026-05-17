package com.ofos.service;

import com.ofos.dto.response.AuditLogResponse;
import com.ofos.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {

    void record(AuditLog auditLog);

    Page<AuditLogResponse> getAuditLogs(String search, String status, String method, Pageable pageable);
}
