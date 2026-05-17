package com.ofos.repository;

import com.ofos.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    
    Optional<NotificationPreference> findByUserId(Long userId);
    
    Optional<NotificationPreference> findByUserEmail(String email);
    
    @Modifying
    @Transactional
    @Query("UPDATE NotificationPreference np SET np.deviceToken = :deviceToken WHERE np.user.id = :userId")
    void updateDeviceToken(@Param("userId") Long userId, @Param("deviceToken") String deviceToken);
}