package com.ofos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RestaurantAddressRequest {
	
    @NotBlank(message = "Street address is required")
    private String streetAddress;
    
    private String landmark;
    
    @NotBlank(message = "City is required")
    private String city;
    
    @NotBlank(message = "State is required")
    private String state;
    
    @NotBlank(message = "Zip code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "Zip code must be 6 digits")
    private String zipCode;
    
    @NotBlank(message = "Country is required")
    private String country;
    
    private Double latitude;
    
    private Double longitude;
}

