package com.ofos.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CartItemResponse {
    private Long id;
    private Long menuItemId;
    private String itemName;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private Boolean isVegetarian;
    private Integer preparationTime;
    private Boolean isAvailable;
    private String specialInstructions;
}