package com.ofos.dto.response;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class TrackingResponse {
    private Long orderId;
    private String orderNumber;
    private String currentStatus;
    private LocalDateTime lastUpdateTime;
    private Map<String, LocalDateTime> statusHistory;
    private DeliveryLocationResponse currentLocation;
    private DeliveryPartnerResponse deliveryPartner;
    private Integer estimatedRemainingMinutes;
    private Integer totalDurationMinutes;
    private String estimatedDeliveryTime;
    
    // order info dikhane k liye use kar rahe h
    private String paymentStatus;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal deliveryFee;
    private BigDecimal discount;
    private BigDecimal totalAmount;
}


