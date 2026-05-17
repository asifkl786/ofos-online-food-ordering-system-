package com.ofos.dto.response;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeliveryLocationResponse {
    private Double latitude;
    private Double longitude;
    private String address;
    private LocalDateTime lastUpdated;
}
