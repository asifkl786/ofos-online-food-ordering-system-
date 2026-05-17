package com.ofos.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.ofos.entity.Payment;
import com.ofos.entity.PaymentStatus;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByTransactionId(String transactionId);
    
    Optional<Payment> findByPaymentOrderId(String paymentOrderId);
    
    Optional<Payment> findByOrderId(Long orderId);

    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    List<Payment> findByPaymentStatus(PaymentStatus status);
    
    Page<Payment> findByOrderUserId(Long userId, Pageable pageable);
    
    @Query("SELECT p FROM Payment p WHERE p.paymentStatus = 'PENDING' AND p.createdAt < :timeout")
    List<Payment> findPendingPaymentsTimeout(@Param("timeout") LocalDateTime timeout);
    
    @Modifying
    @Transactional
    @Query("UPDATE Payment p SET p.paymentStatus = :status, p.paymentDate = :paymentDate, " +
           "p.transactionId = :transactionId WHERE p.id = :paymentId")
    void updatePaymentStatus(@Param("paymentId") Long paymentId,
                             @Param("status") PaymentStatus status,
                             @Param("paymentDate") LocalDateTime paymentDate,
                             @Param("transactionId") String transactionId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Payment p SET p.paymentStatus = :status, p.refundDate = :refundDate, " +
           "p.refundAmount = :refundAmount, p.refundReason = :refundReason WHERE p.id = :paymentId")
    void updateRefundStatus(@Param("paymentId") Long paymentId,
                            @Param("status") PaymentStatus status,
                            @Param("refundDate") LocalDateTime refundDate,
                            @Param("refundAmount") BigDecimal refundAmount,
                            @Param("refundReason") String refundReason);
    
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = 'SUCCESS' AND p.order.restaurant.id = :restaurantId")
    BigDecimal getTotalCollectionByRestaurant(@Param("restaurantId") Long restaurantId);
}
