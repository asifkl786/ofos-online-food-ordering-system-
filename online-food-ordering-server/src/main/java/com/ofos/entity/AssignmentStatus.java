package com.ofos.entity;

public enum AssignmentStatus {
    PENDING,     // Assigned but not accepted
    ACCEPTED,    // Accepted by partner
    REJECTED,    // Rejected by partner
    PICKED_UP,   // Food picked up
    DELIVERED,   // Delivered successfully
    CANCELLED    // Cancelled
}