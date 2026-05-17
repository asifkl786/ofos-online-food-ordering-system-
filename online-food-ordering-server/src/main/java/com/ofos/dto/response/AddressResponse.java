package com.ofos.dto.response;

import lombok.Data;

@Data
public class AddressResponse {
    private Long id;
    private String streetAddress;
    private String apartmentNumber;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String landmark;
    private String addressType;
    private Double latitude;
    double longitude;
    private Boolean isDefault;
    private String phoneNumber;
    private String receiverName;
    private Long userId;
}
