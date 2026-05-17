package com.ofos.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {
 
 @NotBlank(message = "Street address is required")
 private String streetAddress;
 
 private String apartmentNumber;
 
 @NotBlank(message = "City is required")
 private String city;
 
 @NotBlank(message = "State is required")
 private String state;
 
 @NotBlank(message = "Zip code is required")
 private String zipCode;
 
 @NotBlank(message = "Country is required")
 private String country;
 
 private String landmark;
 
 @NotBlank(message = "Address type is required")
 private String addressType;
 
 private Double latitude;
 
 private Double longitude;
 
 private Boolean isDefault = false;
 
 private String phoneNumber;
 
 private String receiverName;
}
