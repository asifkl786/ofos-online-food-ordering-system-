package com.ofos.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistory {
    private OrderStatus status;
    private LocalDateTime timestamp;
    private String notes;
}
