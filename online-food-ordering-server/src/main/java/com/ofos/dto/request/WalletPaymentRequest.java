package com.ofos.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WalletPaymentRequest {
    
    @NotNull(message = "Order ID is required")
    private Long orderId;
}