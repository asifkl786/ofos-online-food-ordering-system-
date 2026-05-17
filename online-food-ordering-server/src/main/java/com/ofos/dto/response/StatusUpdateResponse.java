package com.ofos.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatusUpdateResponse {
    private Long orderId;
    private String orderNumber;
    private String oldStatus;
    private String newStatus;
    private LocalDateTime timestamp;
    private String message;
}
