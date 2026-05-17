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
@Table(name = "delivery_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAssignment extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne
    @JoinColumn(name = "delivery_partner_id", nullable = false)
    private DeliveryPartner deliveryPartner;
    
    @Enumerated(EnumType.STRING)
    private AssignmentStatus assignmentStatus;
    
    private LocalDateTime assignedAt;
    
    private LocalDateTime acceptedAt;
    
    private LocalDateTime pickedUpAt;
    
    private LocalDateTime deliveredAt;
    
    private BigDecimal deliveryFee;
    
    private BigDecimal tipAmount = BigDecimal.ZERO;
    
    private Double distanceInKm;
    
    private Integer estimatedTimeInMinutes;
    
    private Integer actualTimeInMinutes;
    
    private String rejectionReason;
    
    private Boolean isRated = false;
}
