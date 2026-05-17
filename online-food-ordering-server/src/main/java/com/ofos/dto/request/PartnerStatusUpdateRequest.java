package com.ofos.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PartnerStatusUpdateRequest {
    
    @NotNull(message = "Status is required")
    private String status; // ONLINE, OFFLINE, ON_BREAK
}
