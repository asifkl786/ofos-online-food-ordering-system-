package com.ofos.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeliveryPartnerRegistrationRequest {
    
    @NotBlank(message = "Vehicle number is required")
    private String vehicleNumber;
    
    @NotBlank(message = "Vehicle type is required")
    private String vehicleType;
    
    @NotBlank(message = "Driving license number is required")
    private String drivingLicenseNumber;
    
    private String zone;
    
    private BigDecimal basePayPerDelivery;
}