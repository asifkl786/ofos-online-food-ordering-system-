package com.ofos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class RestaurantRequest {
    
    @NotBlank(message = "Restaurant name is required")
    private String name;
    
    private String description;
    
    @NotBlank(message = "Cuisine type is required")
    private String cuisineType;
    
    private BigDecimal minimumOrderAmount;
    
    private BigDecimal deliveryFee;
    
    private LocalTime openingTime;
    
    private LocalTime closingTime;
    
    private String contactPhone;
    
    private String contactEmail;
    
    private String website;
    
    private String gstNumber;
    
    private String fssaiLicenseNumber;
    
    @NotNull(message = "Address is required")
    private RestaurantAddressRequest address;
}

