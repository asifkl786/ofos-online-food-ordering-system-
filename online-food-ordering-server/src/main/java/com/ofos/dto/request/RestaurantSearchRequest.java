package com.ofos.dto.request;

import lombok.Data;

@Data
public class RestaurantSearchRequest {
    
    private String keyword;
    private String cuisineType;
    private String city;
    private Double minRating;
    private Boolean isOpen;
    private Integer page = 0;
    private Integer size = 10;
    private String sortBy = "averageRating";
    private String sortDirection = "DESC";
}
