package com.ofos.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AddMoneyResponse {
    private String transactionReference;
    private BigDecimal amount;
    private BigDecimal newBalance;
    private String paymentOrderId;
    private String paymentPageUrl;
    private String status;
}