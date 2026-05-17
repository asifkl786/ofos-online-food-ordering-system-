package com.ofos.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CartResponse {
    private Long id;
    private Long userId;
    private String userName;
    private List<CartItemResponse> items;
    private Integer totalItems;
    private BigDecimal totalAmount;
    private Long restaurantId;
    private String restaurantName;
    private BigDecimal deliveryFee;
    private BigDecimal tax;
    private BigDecimal grandTotal;
    private Boolean isEmpty;
}