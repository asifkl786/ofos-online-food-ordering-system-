package com.ofos.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WalletResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private BigDecimal balance;
    private BigDecimal totalCredited;
    private BigDecimal totalDebited;
    private Integer totalTransactions;
    private LocalDateTime lastTransactionAt;
    private Boolean isActive;
}