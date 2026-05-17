package com.ofos.dto.response;

import lombok.Data;

@Data
public class DeliveryInfoResponse {
    private Long deliveryPartnerId;
    private String deliveryPartnerName;
    private String deliveryPartnerPhone;
    private Double currentLatitude;
    private Double currentLongitude;
    private String deliveryStatus;
    private String estimatedDeliveryTime;
    private String lastUpdateTime;
}
