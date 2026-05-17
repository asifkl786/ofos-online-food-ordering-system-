package com.ofos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "order_tracking")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderTracking extends BaseEntity {
    
    @OneToOne
    @JoinColumn(name = "order_id", unique = true)
    private Order order;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus currentStatus;
    
    private LocalDateTime lastUpdateTime;
    
	/*
	 * @ElementCollection
	 * 
	 * @CollectionTable(name = "order_status_history")
	 * 
	 * @MapKeyEnumerated(EnumType.STRING)
	 *  private Map<OrderStatus, LocalDateTime>
	 * statusHistory = new HashMap<>();
	 */
    
    // ✅ FIX: Use String as key instead of Enum
    @ElementCollection
    @CollectionTable(name = "order_status_history")
    @MapKeyColumn(name = "status")  // Column name for the map key
    @Column(name = "timestamp")      // Column name for the map value
    private Map<String, LocalDateTime> statusHistory = new HashMap<>();
    
    private Double currentLatitude;
    
    private Double currentLongitude;
    
    private String deliveryPartnerPhone;
    
    private String deliveryPartnerName;
    
    private Integer estimatedRemainingMinutes;
    
    private Integer totalDistanceInMeters;
    
    private String currentLocationAddress;
}