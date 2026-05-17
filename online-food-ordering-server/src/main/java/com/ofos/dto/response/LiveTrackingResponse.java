package com.ofos.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LiveTrackingResponse {
    private Long orderId;
    private String orderNumber;
    private String status;
    private Double deliveryPartnerLatitude;
    private Double deliveryPartnerLongitude;
    private String deliveryPartnerName;
    private String deliveryPartnerPhone;
    private Integer estimatedMinutes;
    private String eta;
    private String lastUpdated;
}