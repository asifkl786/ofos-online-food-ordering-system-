package com.ofos.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class RestaurantUpdateRequest {
    
    private String name;
    private String description;
    private String cuisineType;
    private String logoUrl;
    private String coverImageUrl;
    private BigDecimal minimumOrderAmount;
    private BigDecimal deliveryFee;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private String contactPhone;
    private String contactEmail;
    private String website;
}
