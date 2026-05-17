package com.ofos.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NearbyPartnerResponse {
    private Long id;
    private String name;
    private String phoneNumber;
    private Double distanceInKm;
    private Integer estimatedArrivalMinutes;
    private Double rating;
    private String vehicleType;
}
