package com.ofos.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "delivery_partners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartner extends BaseEntity {
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    @Column(unique = true)
    private String vehicleNumber;
    
    private String vehicleType; // BIKE, SCOOTER, CAR
    
    private String drivingLicenseNumber;
    
    @Column(nullable = false)
    private Boolean isAvailable = true;
    
    @Column(nullable = false)
    private Boolean isVerified = false;
    
    private Double currentLatitude;
    
    private Double currentLongitude;
    
    private String currentAddress;
    
    private BigDecimal totalEarnings = BigDecimal.ZERO;
    
    private Integer totalDeliveries = 0;
    
    private Double averageRating = 0.0;
    
    private Integer totalRatings = 0;
    
    @Enumerated(EnumType.STRING)
    private DeliveryPartnerStatus status = DeliveryPartnerStatus.OFFLINE;
    
    private String zone; // Delivery zone (e.g., "North", "South", "East", "West")
    
    private BigDecimal basePayPerDelivery = BigDecimal.valueOf(40);
    
    private BigDecimal bonusPerDelivery = BigDecimal.ZERO;
    
    @OneToMany(mappedBy = "deliveryPartner")
    private List<DeliveryAssignment> assignments = new ArrayList<>();
}
