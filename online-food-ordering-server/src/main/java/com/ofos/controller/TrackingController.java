package com.ofos.controller;

import com.ofos.dto.request.LocationUpdateRequest;
import com.ofos.dto.request.TrackingStatusRequest;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.LiveTrackingResponse;
import com.ofos.dto.response.TrackingResponse;
import com.ofos.service.TrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.nio.file.AccessDeniedException;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tracking")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Order Tracking", description = "APIs for real-time order tracking")
public class TrackingController {
    
    private final TrackingService trackingService;
    
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER', 'ADMIN')")
    @Operation(summary = "Get order tracking details")
    public ResponseEntity<ApiResponse> getOrderTracking(@PathVariable Long orderId) {
        log.info("REST request to get tracking for order: {}", orderId);
        TrackingResponse response = trackingService.getOrderTracking(orderId);
        return ResponseEntity.ok(ApiResponse.success("Tracking details found", response));
    }
    
    @GetMapping("/live/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get live tracking for order")
    public ResponseEntity<ApiResponse> getLiveTracking(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) throws AccessDeniedException {
        log.info("REST request to get live tracking for order: {}", orderId);
        LiveTrackingResponse response = trackingService.getLiveTracking(orderId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Live tracking data found", response));
    }
    
    @PostMapping("/location")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    @Operation(summary = "Update delivery location (Delivery Partner only)")
    public ResponseEntity<ApiResponse> updateDeliveryLocation(
            @Valid @RequestBody LocationUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update location for order: {}", request.getOrderId());
        trackingService.updateDeliveryLocation(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully", null));
    }
    
    @PostMapping("/status")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'DELIVERY_PARTNER', 'ADMIN')")
    @Operation(summary = "Update order status with tracking")
    public ResponseEntity<ApiResponse> updateOrderStatus(
            @Valid @RequestBody TrackingStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update status for order: {}", request.getOrderId());
        trackingService.updateOrderStatus(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", null));
    }
    
    @GetMapping("/eta/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get estimated delivery time")
    public ResponseEntity<ApiResponse> getEstimatedDeliveryTime(@PathVariable Long orderId) {
        log.info("REST request to get ETA for order: {}", orderId);
        Integer eta = trackingService.getEstimatedDeliveryTime(orderId);
        return ResponseEntity.ok(ApiResponse.success("Estimated delivery time", eta));
    }
}
