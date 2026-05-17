package com.ofos.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentInitResponse {
    private Long orderId;
    private String orderNumber;
    private BigDecimal amount;
    private String paymentOrderId;
    private String razorpayKeyId;
    private String paymentPageUrl;
    private String upiIntentUrl;
}