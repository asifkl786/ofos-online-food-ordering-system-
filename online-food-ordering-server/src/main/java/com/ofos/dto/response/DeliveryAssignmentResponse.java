package com.ofos.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DeliveryAssignmentResponse {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long deliveryPartnerId;
    private String deliveryPartnerName;
    private String assignmentStatus;
    private LocalDateTime assignedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private BigDecimal deliveryFee;
    private BigDecimal tipAmount;
    private Double distanceInKm;
    private Integer estimatedTimeInMinutes;
    private String customerAddress;
    private String customerPhone;
    private String restaurantName;
    private String restaurantAddress;
}