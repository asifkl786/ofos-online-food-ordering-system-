package com.ofos.repository;

import com.ofos.entity.TransactionStatus;
import com.ofos.entity.WalletTransaction;
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
import java.util.Optional;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    Page<WalletTransaction> findAllByOrderByTransactionDateDesc(Pageable pageable);
    
    Page<WalletTransaction> findByWalletIdOrderByTransactionDateDesc(Long walletId, Pageable pageable);
    
    Page<WalletTransaction> findByWalletUserId(Long userId, Pageable pageable);
    
    List<WalletTransaction> findByWalletIdAndTransactionType(Long walletId, String transactionType);
    
    Optional<WalletTransaction> findByTransactionReference(String transactionReference);
    
    List<WalletTransaction> findByStatusAndCreatedAtBefore(TransactionStatus status, LocalDateTime dateTime);
    
    @Query("SELECT wt FROM WalletTransaction wt WHERE wt.wallet.user.id = :userId " +
           "AND wt.transactionDate BETWEEN :startDate AND :endDate")
    List<WalletTransaction> getTransactionsBetweenDates(@Param("userId") Long userId,
                                                        @Param("startDate") LocalDateTime startDate,
                                                        @Param("endDate") LocalDateTime endDate);
    
    @Modifying
    @Transactional
    @Query("UPDATE WalletTransaction wt SET wt.status = :status, " +
           "wt.failureReason = :failureReason WHERE wt.id = :transactionId")
    void updateTransactionStatus(@Param("transactionId") Long transactionId,
                                 @Param("status") TransactionStatus status,
                                 @Param("failureReason") String failureReason);
}
