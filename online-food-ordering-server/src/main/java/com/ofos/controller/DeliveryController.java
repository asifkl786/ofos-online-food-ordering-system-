package com.ofos.controller;

import com.ofos.dto.request.*;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.DeliveryAssignmentResponse;
import com.ofos.dto.response.DeliveryPartnerResponse;
import com.ofos.dto.response.NearbyPartnerResponse;
import com.ofos.service.DeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/delivery")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Delivery Management", description = "APIs for managing deliveries")
public class DeliveryController {
    
    private final DeliveryService deliveryService;
    
    // ==================== Delivery Partner APIs ====================
    
    @PostMapping("/register")
    @Operation(summary = "Register as delivery partner")
    public ResponseEntity<ApiResponse> registerDeliveryPartner(
            @Valid @RequestBody DeliveryPartnerRegistrationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to register delivery partner");
        DeliveryPartnerResponse response = deliveryService.registerDeliveryPartner(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Delivery partner registered successfully", response));
    }
    
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER', 'CUSTOMER')")
    @Operation(summary = "Get delivery partner profile")
    public ResponseEntity<ApiResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get delivery partner profile");
        DeliveryPartnerResponse response = deliveryService.getDeliveryPartnerProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profile found", response));
    }
    
    @PostMapping("/location")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER', 'CUSTOMER')")
    @Operation(summary = "Update current location")
    public ResponseEntity<ApiResponse> updateLocation(
            @Valid @RequestBody PartnerLocationUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update location");
        deliveryService.updatePartnerLocation(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully", null));
    }
    
    @PatchMapping("/status")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER', 'CUSTOMER')")
    @Operation(summary = "Update availability status")
    public ResponseEntity<ApiResponse> updateStatus(
            @Valid @RequestBody PartnerStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update status to: {}", request.getStatus());
        deliveryService.updatePartnerStatus(request, userDetails.getUsername());
        DeliveryPartnerResponse response = deliveryService.getDeliveryPartnerProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", response));
    }

    @GetMapping("/earnings")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER', 'CUSTOMER')")
    @Operation(summary = "Get delivery partner earnings summary")
    public ResponseEntity<ApiResponse> getEarnings(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get delivery earnings summary");
        Map<String, Object> earnings = deliveryService.getPartnerEarnings(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Earnings summary found", earnings));
    }
    
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Get available delivery partners")
    public ResponseEntity<ApiResponse> getAvailablePartners(
            @RequestParam(required = false) String zone,
            @RequestParam(defaultValue = "false") Boolean includeUnavailable) {
        log.info("REST request to get available partners in zone: {}, includeUnavailable: {}", zone, includeUnavailable);
        List<DeliveryPartnerResponse> partners = deliveryService.getAvailablePartners(zone, includeUnavailable);
        return ResponseEntity.ok(ApiResponse.success("Available partners found", partners));
    }

    @GetMapping("/partners")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all delivery partners (Admin only)")
    public ResponseEntity<ApiResponse> getAllDeliveryPartners(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get all delivery partners for admin");
        Page<DeliveryPartnerResponse> partners = deliveryService.getAllDeliveryPartners(pageable);
        return ResponseEntity.ok(ApiResponse.success("Delivery partners found", partners));
    }

    @PatchMapping("/partners/{partnerId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify delivery partner (Admin only)")
    public ResponseEntity<ApiResponse> verifyDeliveryPartner(
            @PathVariable Long partnerId,
            @RequestParam Boolean isVerified) {
        log.info("REST request to update delivery partner verification: {}", partnerId);
        deliveryService.verifyDeliveryPartner(partnerId, isVerified);
        return ResponseEntity.ok(ApiResponse.success("Delivery partner verification updated", null));
    }

    @PatchMapping("/partners/{partnerId}/availability")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update delivery partner availability (Admin only)")
    public ResponseEntity<ApiResponse> updateDeliveryPartnerAvailability(
            @PathVariable Long partnerId,
            @RequestParam Boolean isAvailable) {
        log.info("REST request to update delivery partner availability: {}", partnerId);
        deliveryService.updatePartnerAvailability(partnerId, isAvailable);
        return ResponseEntity.ok(ApiResponse.success("Delivery partner availability updated", null));
    }
    
    @GetMapping("/nearby")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Get nearby delivery partners")
    public ResponseEntity<ApiResponse> getNearbyPartners(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5") Double radiusInKm) {
        log.info("REST request to get nearby partners");
        List<NearbyPartnerResponse> partners = deliveryService.getNearbyPartners(latitude, longitude, radiusInKm);
        return ResponseEntity.ok(ApiResponse.success("Nearby partners found", partners));
    }
    
    // ==================== Assignment APIs ====================
    
    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Assign delivery partner to order")
    public ResponseEntity<ApiResponse> assignDeliveryPartner(@Valid @RequestBody DeliveryAssignmentRequest request) {
        log.info("REST request to assign delivery partner to order: {}", request.getOrderId());
        DeliveryAssignmentResponse response = deliveryService.assignDeliveryPartner(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Delivery partner assigned successfully", response));
    }
    
    @PutMapping("/assignment/status")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER', 'CUSTOMER', 'ADMIN')")
    @Operation(summary = "Update delivery assignment status")
    public ResponseEntity<ApiResponse> updateAssignmentStatus(
            @Valid @RequestBody DeliveryStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update assignment status: {} for assignment: {}", 
            request.getStatus(), request.getAssignmentId());
        DeliveryAssignmentResponse response = deliveryService.updateAssignmentStatus(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Assignment status updated", response));
    }
    
    @GetMapping("/assignment/order/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER', 'ADMIN')")
    @Operation(summary = "Get assignment by order ID")
    public ResponseEntity<ApiResponse> getAssignmentByOrderId(@PathVariable Long orderId) {
        log.info("REST request to get assignment for order: {}", orderId);
        DeliveryAssignmentResponse response = deliveryService.getAssignmentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("Assignment found", response));
    }
    
    @GetMapping("/assignments/my")
    @PreAuthorize("hasAnyRole('DELIVERY_PARTNER', 'CUSTOMER')")
    @Operation(summary = "Get my active assignments")
    public ResponseEntity<ApiResponse> getMyAssignments(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get my assignments");
        List<DeliveryAssignmentResponse> assignments = deliveryService.getPartnerAssignments(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Assignments found", assignments));
    }
}
