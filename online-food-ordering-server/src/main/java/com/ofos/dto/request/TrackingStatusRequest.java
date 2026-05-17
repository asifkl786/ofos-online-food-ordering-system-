package com.ofos.dto.request;

import com.ofos.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TrackingStatusRequest {
    
    @NotNull(message = "Order ID is required")
    private Long orderId;
    
    @NotNull(message = "Status is required")
    private OrderStatus status;
    
    private String notes;
}