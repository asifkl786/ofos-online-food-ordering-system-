package com.ofos.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WalletTransactionResponse {
    private Long id;
    private String transactionReference;
    private BigDecimal amount;
    private String transactionType;
    private String status;
    private String mode;
    private String description;
    private LocalDateTime transactionDate;
    private BigDecimal closingBalance;
    private Long orderId;
    private String orderNumber;
}