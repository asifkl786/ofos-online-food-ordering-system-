package com.ofos.controller;

import com.ofos.dto.request.RestaurantRequest;
import com.ofos.dto.request.RestaurantSearchRequest;
import com.ofos.dto.request.RestaurantUpdateRequest;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.RestaurantResponse;
import com.ofos.exception.BusinessException;
import com.ofos.service.RestaurantService;
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

import java.util.Map;

@RestController
@RequestMapping("/restaurants")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Restaurant Management", description = "APIs for managing restaurants")
public class RestaurantController {
    
    private final RestaurantService restaurantService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Create a new restaurant")
    public ResponseEntity<ApiResponse> createRestaurant(
            @Valid @RequestBody RestaurantRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to create restaurant");
        RestaurantResponse response = restaurantService.createRestaurant(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Restaurant created successfully", response));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get restaurant by ID")
    public ResponseEntity<ApiResponse> getRestaurantById(@PathVariable Long id) {
        log.info("REST request to get restaurant by id: {}", id);
        RestaurantResponse response = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(ApiResponse.success("Restaurant found", response));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Update restaurant")
    public ResponseEntity<ApiResponse> updateRestaurant(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update restaurant with id: {}", id);
        RestaurantResponse response = restaurantService.updateRestaurant(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Restaurant updated successfully", response));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Delete restaurant")
    public ResponseEntity<ApiResponse> deleteRestaurant(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to delete restaurant with id: {}", id);
        restaurantService.deleteRestaurant(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Restaurant deleted successfully", null));
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Update restaurant open/close status")
    public ResponseEntity<ApiResponse> updateRestaurantStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean isOpen,
            @RequestBody(required = false) Map<String, Boolean> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Accept both query param and JSON body so admin actions stay compatible with different clients.
        Boolean resolvedIsOpen = isOpen != null ? isOpen : request != null ? request.get("isOpen") : null;
        if (resolvedIsOpen == null) {
            throw new BusinessException("Restaurant open/close status is required");
        }

        log.info("REST request to update restaurant status for id: {} to {}", id, resolvedIsOpen);
        restaurantService.updateRestaurantStatus(id, resolvedIsOpen, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Restaurant status updated successfully", null));
    }
    
    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify restaurant (Admin only)")
    public ResponseEntity<ApiResponse> verifyRestaurant(
            @PathVariable Long id,
            @RequestParam Boolean isVerified) {
        log.info("REST request to verify restaurant with id: {} as {}", id, isVerified);
        restaurantService.verifyRestaurant(id, isVerified);
        return ResponseEntity.ok(ApiResponse.success("Restaurant verification status updated", null));
    }
    
    @GetMapping
    @Operation(summary = "Get all restaurants with pagination")
    public ResponseEntity<ApiResponse> getAllRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        log.info("REST request to get all restaurants");
        Page<RestaurantResponse> restaurants = restaurantService.getAllRestaurants(page, size, sortBy, sortDirection);
        return ResponseEntity.ok(ApiResponse.success("Restaurants found", restaurants));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Get restaurants for current owner")
    public ResponseEntity<ApiResponse> getMyRestaurants(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get restaurants for current owner");
        Long ownerId = restaurantService.getOwnerIdByEmail(userDetails.getUsername());
        Page<RestaurantResponse> restaurants = restaurantService.getRestaurantsByOwner(ownerId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Restaurants found", restaurants));
    }
    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Get restaurants by owner ID")
    public ResponseEntity<ApiResponse> getRestaurantsByOwner(
            @PathVariable Long ownerId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get restaurants for owner: {}", ownerId);
        Long currentOwnerId = restaurantService.getOwnerIdByEmail(userDetails.getUsername());
        // Restaurant owners can request only their own restaurants; this prevents ownerId URL tampering.
        if (!ownerId.equals(currentOwnerId)) {
            throw new BusinessException("You are not authorized to view another owner restaurants");
        }
        Page<RestaurantResponse> restaurants = restaurantService.getRestaurantsByOwner(ownerId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Restaurants found", restaurants));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search restaurants by keyword")
    public ResponseEntity<ApiResponse> searchRestaurants(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to search restaurants with keyword: {}", keyword);
        Page<RestaurantResponse> restaurants = restaurantService.searchRestaurants(keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success("Restaurants found", restaurants));
    }
    
    @PostMapping("/filter")
    @Operation(summary = "Filter restaurants with multiple criteria")
    public ResponseEntity<ApiResponse> filterRestaurants(@RequestBody RestaurantSearchRequest request) {
        log.info("REST request to filter restaurants");
        Page<RestaurantResponse> restaurants = restaurantService.filterRestaurants(request);
        return ResponseEntity.ok(ApiResponse.success("Restaurants found", restaurants));
    }
    
    @GetMapping("/{id}/stats")
    @Operation(summary = "Get restaurant statistics")
    public ResponseEntity<ApiResponse> getRestaurantStats(@PathVariable Long id) {
        log.info("REST request to get stats for restaurant: {}", id);
        Long totalOrders = restaurantService.getTotalOrdersCount(id);
        java.math.BigDecimal totalRevenue = restaurantService.getTotalRevenue(id);
        
        return ResponseEntity.ok(ApiResponse.success("Restaurant stats found", 
                java.util.Map.of("totalOrders", totalOrders, "totalRevenue", totalRevenue)));
    }
    
    @GetMapping("/top-rated")
    @Operation(summary = "Get top rated restaurants")
    public ResponseEntity<ApiResponse> getTopRatedRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get top rated restaurants");
        Page<RestaurantResponse> restaurants = restaurantService.getAllRestaurants(page, size, "averageRating", "DESC");
        return ResponseEntity.ok(ApiResponse.success("Top rated restaurants found", restaurants));
    }
}





