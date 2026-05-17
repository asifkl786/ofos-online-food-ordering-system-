package com.ofos.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartCheckoutRequest {
    
    @NotNull(message = "Address ID is required")
    private Long addressId;
    
    private String specialInstructions;
    
    private String couponCode;
}