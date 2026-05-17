package com.ofos.dto.response;

import lombok.Data;

@Data
public class RestaurantAddressResponse {
    private Long id;
    private String streetAddress;
    private String landmark;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private Double latitude;
    private Double longitude;
    private Boolean isPrimary;
}
