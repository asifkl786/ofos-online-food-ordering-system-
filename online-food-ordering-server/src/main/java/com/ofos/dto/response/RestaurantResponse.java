package com.ofos.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Data
public class RestaurantResponse {
    private Long id;
    private String name;
    private String description;
    private String logoUrl;
    private String coverImageUrl;
    private String cuisineType;
    private BigDecimal minimumOrderAmount;
    private BigDecimal deliveryFee;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Boolean isOpen;
    private Double averageRating;
    private Integer totalReviews;
    private Long ownerId;
    private String ownerName;
    private Integer menuItemsCount;
    private List<RestaurantAddressResponse> addresses;
    private List<MenuItemResponse> menuItems;
    private List<AddressResponse> addressess;
}
