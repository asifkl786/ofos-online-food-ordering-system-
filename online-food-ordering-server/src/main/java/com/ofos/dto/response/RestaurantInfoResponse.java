package com.ofos.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RestaurantInfoResponse {
    private Long id;
    private String name;
    private String description;
    private String cuisineType;
    private String logoUrl;
    private String coverImageUrl;
    private Double averageRating;
    private Integer totalReviews;
    private Boolean isOpen;
    private BigDecimal minimumOrderAmount;
    private BigDecimal deliveryFee;
    private String openingTime;
    private String closingTime;
    private String contactPhone;
    private String contactEmail;
    private String gstNumber;
    private String fssaiLicenseNumber;
    private String address;
}
