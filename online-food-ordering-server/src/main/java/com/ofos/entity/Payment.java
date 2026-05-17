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
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends BaseEntity {
    
    @Column(unique = true)
    private String transactionId;
    
    @Column(unique = true)
    private String paymentOrderId; // Razorpay order ID
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;
    
    private String paymentGateway; // RAZORPAY, STRIPE, etc.
    
    @Column(length = 1000)
    private String paymentResponse; // JSON response from gateway
    
    private String paymentSignature; // Webhook signature
    
    private LocalDateTime paymentDate;
    
    private LocalDateTime refundDate;
    
    private BigDecimal refundAmount;
    
    private String refundReason;
    
    @OneToOne
    @JoinColumn(name = "order_id", unique = true)
    private Order order;
}