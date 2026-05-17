package com.ofos.service;

import com.ofos.dto.request.RestaurantRequest;
import com.ofos.dto.request.RestaurantSearchRequest;
import com.ofos.dto.request.RestaurantUpdateRequest;
import com.ofos.dto.response.RestaurantResponse;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;

public interface RestaurantService {
    
    RestaurantResponse createRestaurant(RestaurantRequest request, String ownerEmail);
    
    RestaurantResponse updateRestaurant(Long restaurantId, RestaurantUpdateRequest request, String ownerEmail);
    
    RestaurantResponse getRestaurantById(Long id);
    
    Page<RestaurantResponse> getAllRestaurants(int page, int size, String sortBy, String sortDirection);
    
    Long getOwnerIdByEmail(String ownerEmail);
    
    Page<RestaurantResponse> getRestaurantsByOwner(Long ownerId, int page, int size);
    
    Page<RestaurantResponse> searchRestaurants(String keyword, int page, int size);
    
    Page<RestaurantResponse> filterRestaurants(RestaurantSearchRequest request);
    
    void updateRestaurantStatus(Long restaurantId, Boolean isOpen, String ownerEmail);
    
    void verifyRestaurant(Long restaurantId, Boolean isVerified);
    
    void deleteRestaurant(Long restaurantId, String ownerEmail);
    
    Long getTotalOrdersCount(Long restaurantId);
    
    BigDecimal getTotalRevenue(Long restaurantId);
    
    void updateRestaurantRating(Long restaurantId);
}
