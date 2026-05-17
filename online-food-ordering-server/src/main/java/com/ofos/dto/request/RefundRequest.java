package com.ofos.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RefundRequest {
    
    @NotNull(message = "Payment ID is required")
    private Long paymentId;
    
    @Positive(message = "Refund amount must be positive")
    private BigDecimal refundAmount;
    
    private String refundReason;
}
