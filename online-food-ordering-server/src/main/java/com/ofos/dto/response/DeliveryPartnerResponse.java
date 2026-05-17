package com.ofos.dto.response;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class DeliveryPartnerResponse {
    private Long id;
    private Long userId;
    private String name;
    private String phoneNumber;
    private String email;
    private String vehicleNumber;
    private String vehicleType;
    private Boolean isAvailable;
    private Boolean isVerified;
    private String status;
    private Double currentLatitude;
    private Double currentLongitude;
    private String zone;
    private BigDecimal totalEarnings;
    private Integer totalDeliveries;
    private Double averageRating;
}
