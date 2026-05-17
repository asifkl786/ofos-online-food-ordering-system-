package com.ofos.service;

import com.ofos.dto.request.MenuItemRequest;
import com.ofos.dto.request.MenuItemUpdateRequest;
import com.ofos.dto.response.MenuItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface MenuItemService {
    
    MenuItemResponse addMenuItem(MenuItemRequest request, Long restaurantId, String ownerEmail);
    
    MenuItemResponse updateMenuItem(Long menuItemId, MenuItemUpdateRequest request, String ownerEmail);
    
    MenuItemResponse getMenuItemById(Long id);

    Page<MenuItemResponse> getAllMenuItems(Pageable pageable);
    
    Page<MenuItemResponse> getMenuItemsByRestaurant(Long restaurantId, int page, int size);
    
    Page<MenuItemResponse> getAvailableMenuItemsByRestaurant(Long restaurantId, int page, int size);
    
    Page<MenuItemResponse> searchMenuItems(Long restaurantId, String keyword, int page, int size);
    
    List<MenuItemResponse> getMenuItemsByCategory(Long restaurantId, Long categoryId);
    
    List<MenuItemResponse> getDiscountedMenuItems(Long restaurantId);
    
    void updateAvailability(Long menuItemId, Boolean isAvailable, String ownerEmail);
    
    void updatePrice(Long menuItemId, BigDecimal price, String ownerEmail);
    
    void updateDiscount(Long menuItemId, Integer discountPercentage, String ownerEmail);
    
    void deleteMenuItem(Long menuItemId, String ownerEmail);
    
    List<MenuItemResponse> getVegetarianMenuItems(Long restaurantId);
    
    List<MenuItemResponse> getMenuItemsByPriceRange(Long restaurantId, BigDecimal minPrice, BigDecimal maxPrice);
}
