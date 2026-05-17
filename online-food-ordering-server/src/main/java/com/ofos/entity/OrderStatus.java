package com.ofos.entity;

public enum OrderStatus {
    PENDING,        // Order placed, waiting for restaurant confirmation
    CONFIRMED,      // Restaurant accepted order
    PREPARING,      // Restaurant is preparing food
    READY_FOR_PICKUP, // Food ready for delivery partner pickup
    OUT_FOR_DELIVERY, // Delivery partner on the way
    DELIVERED,      // Order delivered successfully
    CANCELLED,      // Order cancelled
    REFUNDED        // Order cancelled and refunded
}