package com.ofos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "wallet_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransaction extends BaseEntity {
    
    @Column(unique = true, nullable = false)
    private String transactionReference;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private TransactionType transactionType; // CREDIT, DEBIT
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus status; // PENDING, SUCCESS, FAILED
    
    @Enumerated(EnumType.STRING)
    private TransactionMode mode; // UPI, CARD, NET_BANKING, REFUND, ORDER_PAYMENT
    
    private String description;
    
    private LocalDateTime transactionDate;
    
    private BigDecimal closingBalance;
    
    private String paymentGatewayTransactionId;
    
    private String failureReason;
    
    @ManyToOne
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;
    
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}