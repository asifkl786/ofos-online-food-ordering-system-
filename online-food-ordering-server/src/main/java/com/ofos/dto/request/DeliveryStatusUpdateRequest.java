package com.ofos.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeliveryStatusUpdateRequest {
    
    @NotNull(message = "Assignment ID is required")
    private Long assignmentId;
    
    @NotNull(message = "Status is required")
    private String status; // ACCEPTED, PICKED_UP, DELIVERED
    
    private String rejectionReason;
}