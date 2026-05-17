package com.ofos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class MenuItemRequest {
    
    @NotBlank(message = "Menu item name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    private Integer preparationTime;
    
    private String imageUrl;
    
    private Boolean isAvailable = true;
    
    private Boolean isVegetarian = false;
    
    private Boolean isVegan = false;
    
    private Boolean isGlutenFree = false;
    
    private Boolean isSpicy = false;
    
    private Integer calories;
    
    private Integer discountPercentage = 0;
    
    private Integer maxOrderQuantity = 10;
    
    private Long categoryId;
    
    private List<String> availableAddons;
    
    private List<String> additionalImages;
}