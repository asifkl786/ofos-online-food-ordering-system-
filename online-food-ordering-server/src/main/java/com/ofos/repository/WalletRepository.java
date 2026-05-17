package com.ofos.repository;

import com.ofos.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    
    Optional<Wallet> findByUserId(Long userId);
    
    Optional<Wallet> findByUserEmail(String email);
    
    @Modifying
    @Transactional
    @Query("UPDATE Wallet w SET w.balance = w.balance + :amount, " +
           "w.totalCredited = w.totalCredited + :amount, " +
           "w.totalTransactions = w.totalTransactions + 1, " +
           "w.lastTransactionAt = CURRENT_TIMESTAMP " +
           "WHERE w.id = :walletId")
    void creditBalance(@Param("walletId") Long walletId, @Param("amount") BigDecimal amount);
    
    @Modifying
    @Transactional
    @Query("UPDATE Wallet w SET w.balance = w.balance - :amount, " +
           "w.totalDebited = w.totalDebited + :amount, " +
           "w.totalTransactions = w.totalTransactions + 1, " +
           "w.lastTransactionAt = CURRENT_TIMESTAMP " +
           "WHERE w.id = :walletId AND w.balance >= :amount")
    int debitBalance(@Param("walletId") Long walletId, @Param("amount") BigDecimal amount);
    
    @Query("SELECT w.balance FROM Wallet w WHERE w.user.id = :userId")
    BigDecimal getBalanceByUserId(@Param("userId") Long userId);
    
    @Query("SELECT CASE WHEN w.balance >= :amount THEN true ELSE false END " +
           "FROM Wallet w WHERE w.user.id = :userId")
    boolean hasSufficientBalance(@Param("userId") Long userId, @Param("amount") BigDecimal amount);
}