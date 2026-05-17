package com.ofos.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class MenuItemUpdateRequest {
    
    private String name;
    private String description;
    private BigDecimal price;
    private Integer preparationTime;
    private String imageUrl;
    private Boolean isAvailable;
    private Boolean isVegetarian;
    private Boolean isVegan;
    private Boolean isGlutenFree;
    private Boolean isSpicy;
    private Integer calories;
    private Integer discountPercentage;
    private Integer maxOrderQuantity;
    private Long categoryId;
    private List<String> availableAddons;
    private List<String> additionalImages;
}
