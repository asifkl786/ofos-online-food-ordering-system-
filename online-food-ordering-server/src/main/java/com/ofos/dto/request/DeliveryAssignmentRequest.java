package com.ofos.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeliveryAssignmentRequest {
    
    @NotNull(message = "Order ID is required")
    private Long orderId;
    
    @NotNull(message = "Delivery partner ID is required")
    private Long deliveryPartnerId;
    
    private BigDecimal tipAmount;
}