package com.ofos.repository;

import com.ofos.entity.AssignmentStatus;
import com.ofos.entity.DeliveryAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
    
    Optional<DeliveryAssignment> findByOrderId(Long orderId);
    
    List<DeliveryAssignment> findByDeliveryPartnerId(Long partnerId);
    
    List<DeliveryAssignment> findByDeliveryPartnerIdAndAssignmentStatus(
        Long partnerId, AssignmentStatus status);
    
    @Query("SELECT da FROM DeliveryAssignment da WHERE da.deliveryPartner.id = :partnerId " +
           "AND da.assignmentStatus IN :statuses ORDER BY da.assignedAt DESC")
    List<DeliveryAssignment> findActiveAssignments(@Param("partnerId") Long partnerId,
                                                    @Param("statuses") List<AssignmentStatus> statuses);
    
    @Modifying
    @Transactional
    @Query("UPDATE DeliveryAssignment da SET da.assignmentStatus = :status, " +
           "da.acceptedAt = :acceptedAt WHERE da.id = :assignmentId")
    void acceptAssignment(@Param("assignmentId") Long assignmentId,
                          @Param("status") AssignmentStatus status,
                          @Param("acceptedAt") LocalDateTime acceptedAt);
    
    @Modifying
    @Transactional
    @Query("UPDATE DeliveryAssignment da SET da.assignmentStatus = :status, " +
           "da.pickedUpAt = :pickedUpAt WHERE da.id = :assignmentId")
    void markPickedUp(@Param("assignmentId") Long assignmentId,
                      @Param("status") AssignmentStatus status,
                      @Param("pickedUpAt") LocalDateTime pickedUpAt);
    
    @Modifying
    @Transactional
    @Query("UPDATE DeliveryAssignment da SET da.assignmentStatus = :status, " +
           "da.deliveredAt = :deliveredAt, da.actualTimeInMinutes = :actualTime " +
           "WHERE da.id = :assignmentId")
    void markDelivered(@Param("assignmentId") Long assignmentId,
                       @Param("status") AssignmentStatus status,
                       @Param("deliveredAt") LocalDateTime deliveredAt,
                       @Param("actualTime") Integer actualTime);
}