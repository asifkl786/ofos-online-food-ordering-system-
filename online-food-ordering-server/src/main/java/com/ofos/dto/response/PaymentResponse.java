package com.ofos.dto.response;

import com.ofos.entity.PaymentMethod;
import com.ofos.entity.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private Long id;
    private String transactionId;
    private String paymentOrderId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String paymentGateway;
    private LocalDateTime paymentDate;
    private BigDecimal refundAmount;
    private LocalDateTime refundDate;
    private Long orderId;
    private String orderNumber;
}