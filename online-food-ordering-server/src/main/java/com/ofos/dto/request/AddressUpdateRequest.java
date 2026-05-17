package com.ofos.dto.request;

import lombok.Data;

@Data
public class AddressUpdateRequest {
    
    private String streetAddress;
    private String apartmentNumber;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String landmark;
    private String addressType;
    private Double latitude;
    private Double longitude;
    private Boolean isDefault;
    private String phoneNumber;
    private String receiverName;
}
