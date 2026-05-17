package com.ofos.entity;

public enum PaymentStatus {
    PENDING,    // Payment initiated
    SUCCESS,    // Payment successful
    FAILED,     // Payment failed
    REFUNDED,    // Amount refunded
    PARTIALLY_REFUNDED
}