package com.ofos.service.impl;

import com.ofos.dto.response.AuditLogResponse;
import com.ofos.entity.AuditLog;
import com.ofos.repository.AuditLogRepository;
import com.ofos.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(AuditLog auditLog) {
        // Audit logs should survive even if the original request transaction rolls back.
        auditLogRepository.save(auditLog);
    }

    @Override
    public Page<AuditLogResponse> getAuditLogs(String search, String status, String method, Pageable pageable) {
        return auditLogRepository.searchAuditLogs(search, status, method, pageable)
                .map(this::convertToResponse);
    }

    private AuditLogResponse convertToResponse(AuditLog auditLog) {
        return modelMapper.map(auditLog, AuditLogResponse.class);
    }
}
