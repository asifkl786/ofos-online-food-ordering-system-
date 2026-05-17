package com.ofos.repository;

import com.ofos.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Keeps the admin UI fast and flexible without loading every audit row in the browser.
    @Query("""
            SELECT a FROM AuditLog a
            WHERE (:search IS NULL OR :search = ''
                OR LOWER(a.adminEmail) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(a.resource) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(a.endpoint) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:status IS NULL OR :status = 'ALL'
                OR (:status = 'SUCCESS' AND a.success = true)
                OR (:status = 'FAILED' AND a.success = false))
            AND (:method IS NULL OR :method = 'ALL' OR a.httpMethod = :method)
            ORDER BY a.createdAt DESC
            """)
    Page<AuditLog> searchAuditLogs(@Param("search") String search,
                                   @Param("status") String status,
                                   @Param("method") String method,
                                   Pageable pageable);
}
