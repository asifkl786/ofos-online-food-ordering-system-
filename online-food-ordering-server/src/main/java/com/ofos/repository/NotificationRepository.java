package com.ofos.repository;

import com.ofos.entity.Notification;
import com.ofos.entity.NotificationChannel;
import com.ofos.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Notification> findByUserIdAndIsReadFalse(Long userId);
    
    Page<Notification> findByOrderId(Long orderId, Pageable pageable);
    
    List<Notification> findByIsSentFalseAndCreatedAtBefore(LocalDateTime dateTime);
    
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.type = :type ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdAndType(@Param("userId") Long userId, 
                                            @Param("type") NotificationType type, 
                                            Pageable pageable);
    
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.id = :notificationId")
    void markAsRead(@Param("notificationId") Long notificationId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId")
    void markAllAsRead(@Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isSent = true, n.sentAt = CURRENT_TIMESTAMP WHERE n.id = :notificationId")
    void markAsSent(@Param("notificationId") Long notificationId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.retryCount = n.retryCount + 1, n.errorMessage = :error WHERE n.id = :notificationId")
    void incrementRetryCount(@Param("notificationId") Long notificationId, @Param("error") String error);
    
    Long countByUserIdAndIsReadFalse(Long userId);
}
