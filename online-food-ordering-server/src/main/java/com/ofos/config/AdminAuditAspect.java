package com.ofos.config;

import com.ofos.entity.AuditLog;
import com.ofos.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminAuditAspect {

    private final AuditLogService auditLogService;

    @Around("within(@org.springframework.web.bind.annotation.RestController *)")
    public Object auditAdminMutation(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = getCurrentRequest();
        if (!shouldAudit(request)) {
            return joinPoint.proceed();
        }

        long startedAt = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            saveAuditLog(request, joinPoint, true, 200, null, startedAt);
            return result;
        } catch (Throwable throwable) {
            saveAuditLog(request, joinPoint, false, 500, throwable.getMessage(), startedAt);
            throw throwable;
        }
    }

    private boolean shouldAudit(HttpServletRequest request) {
        if (request == null) {
            return false;
        }

        String method = request.getMethod();
        if ("GET".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method)) {
            return false;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // Enterprise audit scope: record mutating requests made by admin operators.
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private void saveAuditLog(HttpServletRequest request,
                              ProceedingJoinPoint joinPoint,
                              boolean success,
                              int fallbackStatus,
                              String errorMessage,
                              long startedAt) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            AuditLog auditLog = new AuditLog();
            auditLog.setAdminEmail(authentication.getName());
            auditLog.setAdminRole(authentication.getAuthorities().toString());
            auditLog.setAction(buildAction(request, joinPoint));
            auditLog.setResource(extractResource(request.getRequestURI()));
            auditLog.setHttpMethod(request.getMethod());
            auditLog.setEndpoint(buildEndpoint(request));
            auditLog.setResponseStatus(fallbackStatus);
            auditLog.setSuccess(success);
            auditLog.setIpAddress(resolveClientIp(request));
            auditLog.setUserAgent(limit(request.getHeader("User-Agent"), 250));
            auditLog.setErrorMessage(limit(errorMessage, 1000));

            // Duration in the action string makes the activity list more useful during debugging.
            auditLog.setAction(auditLog.getAction() + " (" + (System.currentTimeMillis() - startedAt) + "ms)");
            auditLogService.record(auditLog);
        } catch (Exception ex) {
            log.warn("Failed to write admin audit log", ex);
        }
    }

    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private String buildAction(HttpServletRequest request, ProceedingJoinPoint joinPoint) {
        return request.getMethod() + " " + joinPoint.getSignature().getName();
    }

    private String buildEndpoint(HttpServletRequest request) {
        String query = request.getQueryString();
        return limit(request.getRequestURI() + (query != null ? "?" + query : ""), 600);
    }

    private String extractResource(String uri) {
        String[] parts = uri.split("/");
        return parts.length > 1 ? parts[1] : "platform";
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String limit(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
