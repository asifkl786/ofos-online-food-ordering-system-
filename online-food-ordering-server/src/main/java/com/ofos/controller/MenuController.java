package com.ofos.controller;

import com.ofos.dto.request.MenuItemRequest;
import com.ofos.dto.request.MenuItemUpdateRequest;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.MenuItemResponse;
import com.ofos.exception.BusinessException;
import com.ofos.service.MenuItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/menu")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Menu Management", description = "APIs for managing restaurant menu items")
public class MenuController {
    
    private final MenuItemService menuItemService;
    
    @PostMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Add menu item to restaurant")
    public ResponseEntity<ApiResponse> addMenuItem(
            @PathVariable Long restaurantId,
            @Valid @RequestBody MenuItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to add menu item to restaurant: {}", restaurantId);
        MenuItemResponse response = menuItemService.addMenuItem(request, restaurantId, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Menu item added successfully", response));
    }
    
    @PutMapping("/{menuItemId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Update menu item")
    public ResponseEntity<ApiResponse> updateMenuItem(
            @PathVariable Long menuItemId,
            @Valid @RequestBody MenuItemUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update menu item: {}", menuItemId);
        MenuItemResponse response = menuItemService.updateMenuItem(menuItemId, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Menu item updated successfully", response));
    }
    
    @GetMapping("/{menuItemId}")
    @Operation(summary = "Get menu item by ID")
    public ResponseEntity<ApiResponse> getMenuItemById(@PathVariable Long menuItemId) {
        log.info("REST request to get menu item: {}", menuItemId);
        MenuItemResponse response = menuItemService.getMenuItemById(menuItemId);
        return ResponseEntity.ok(ApiResponse.success("Menu item found", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all menu items (Admin only)")
    public ResponseEntity<ApiResponse> getAllMenuItems(
            @org.springframework.data.web.PageableDefault(size = 10, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC)
            org.springframework.data.domain.Pageable pageable) {
        log.info("REST request to get all menu items for admin");
        Page<MenuItemResponse> menuItems = menuItemService.getAllMenuItems(pageable);
        return ResponseEntity.ok(ApiResponse.success("Menu items found", menuItems));
    }
    
    @GetMapping("/restaurant/{restaurantId}")
    @Operation(summary = "Get all menu items for a restaurant")
    public ResponseEntity<ApiResponse> getMenuItemsByRestaurant(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get menu items for restaurant: {}", restaurantId);
        Page<MenuItemResponse> menuItems = menuItemService.getMenuItemsByRestaurant(restaurantId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Menu items found", menuItems));
    }
    
    @GetMapping("/restaurant/{restaurantId}/available")
    @Operation(summary = "Get available menu items for a restaurant")
    public ResponseEntity<ApiResponse> getAvailableMenuItems(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get available menu items for restaurant: {}", restaurantId);
        Page<MenuItemResponse> menuItems = menuItemService.getAvailableMenuItemsByRestaurant(restaurantId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Available menu items found", menuItems));
    }
    
    @GetMapping("/restaurant/{restaurantId}/search")
    @Operation(summary = "Search menu items in a restaurant")
    public ResponseEntity<ApiResponse> searchMenuItems(
            @PathVariable Long restaurantId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to search menu items in restaurant: {} with keyword: {}", restaurantId, keyword);
        Page<MenuItemResponse> menuItems = menuItemService.searchMenuItems(restaurantId, keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success("Menu items found", menuItems));
    }
    
    @GetMapping("/restaurant/{restaurantId}/category/{categoryId}")
    @Operation(summary = "Get menu items by category")
    public ResponseEntity<ApiResponse> getMenuItemsByCategory(
            @PathVariable Long restaurantId,
            @PathVariable Long categoryId) {
        log.info("REST request to get menu items by category: {} for restaurant: {}", categoryId, restaurantId);
        List<MenuItemResponse> menuItems = menuItemService.getMenuItemsByCategory(restaurantId, categoryId);
        return ResponseEntity.ok(ApiResponse.success("Menu items found", menuItems));
    }
    
    @GetMapping("/restaurant/{restaurantId}/discounted")
    @Operation(summary = "Get discounted menu items")
    public ResponseEntity<ApiResponse> getDiscountedMenuItems(@PathVariable Long restaurantId) {
        log.info("REST request to get discounted menu items for restaurant: {}", restaurantId);
        List<MenuItemResponse> menuItems = menuItemService.getDiscountedMenuItems(restaurantId);
        return ResponseEntity.ok(ApiResponse.success("Discounted menu items found", menuItems));
    }
    
    @GetMapping("/restaurant/{restaurantId}/vegetarian")
    @Operation(summary = "Get vegetarian menu items")
    public ResponseEntity<ApiResponse> getVegetarianMenuItems(@PathVariable Long restaurantId) {
        log.info("REST request to get vegetarian menu items for restaurant: {}", restaurantId);
        List<MenuItemResponse> menuItems = menuItemService.getVegetarianMenuItems(restaurantId);
        return ResponseEntity.ok(ApiResponse.success("Vegetarian menu items found", menuItems));
    }
    
    @GetMapping("/restaurant/{restaurantId}/price-range")
    @Operation(summary = "Get menu items by price range")
    public ResponseEntity<ApiResponse> getMenuItemsByPriceRange(
            @PathVariable Long restaurantId,
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {
        log.info("REST request to get menu items by price range for restaurant: {}", restaurantId);
        List<MenuItemResponse> menuItems = menuItemService.getMenuItemsByPriceRange(restaurantId, minPrice, maxPrice);
        return ResponseEntity.ok(ApiResponse.success("Menu items found", menuItems));
    }
    
    @PatchMapping("/{menuItemId}/availability")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Update menu item availability")
    public ResponseEntity<ApiResponse> updateAvailability(
            @PathVariable Long menuItemId,
            @RequestParam Boolean isAvailable,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update availability for menu item: {} to {}", menuItemId, isAvailable);
        menuItemService.updateAvailability(menuItemId, isAvailable, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Availability updated successfully", null));
    }
    
    @PatchMapping("/{menuItemId}/price")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Update menu item price")
    public ResponseEntity<ApiResponse> updatePrice(
            @PathVariable Long menuItemId,
            @RequestParam(required = false) BigDecimal price,
            @RequestBody(required = false) Map<String, BigDecimal> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Accept price from query param or JSON body to keep admin quick actions reliable.
        BigDecimal resolvedPrice = price != null ? price : request != null ? request.get("price") : null;
        if (resolvedPrice == null) {
            throw new BusinessException("Menu item price is required");
        }

        log.info("REST request to update price for menu item: {} to {}", menuItemId, resolvedPrice);
        menuItemService.updatePrice(menuItemId, resolvedPrice, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Price updated successfully", null));
    }
    
    @PatchMapping("/{menuItemId}/discount")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Update menu item discount")
    public ResponseEntity<ApiResponse> updateDiscount(
            @PathVariable Long menuItemId,
            @RequestParam(required = false) Integer discountPercentage,
            @RequestBody(required = false) Map<String, Integer> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Accept discount from query param or JSON body to keep admin quick actions reliable.
        Integer resolvedDiscount = discountPercentage != null
                ? discountPercentage
                : request != null ? request.get("discountPercentage") : null;
        if (resolvedDiscount == null) {
            throw new BusinessException("Menu item discount percentage is required");
        }

        log.info("REST request to update discount for menu item: {} to {}%", menuItemId, resolvedDiscount);
        menuItemService.updateDiscount(menuItemId, resolvedDiscount, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Discount updated successfully", null));
    }
    
    @DeleteMapping("/{menuItemId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Delete menu item")
    public ResponseEntity<ApiResponse> deleteMenuItem(
            @PathVariable Long menuItemId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to delete menu item: {}", menuItemId);
        menuItemService.deleteMenuItem(menuItemId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Menu item deleted successfully", null));
    }
}





