package com.ofos.controller;

import com.ofos.dto.request.AddressRequest;
import com.ofos.dto.request.AddressUpdateRequest;
import com.ofos.dto.response.AddressResponse;
import com.ofos.dto.response.ApiResponse;
import com.ofos.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Address Management", description = "APIs for managing user addresses")
public class AddressController {
    
    private final AddressService addressService;
    
    // Profile addresses are shared by all authenticated app roles, not only customers.
    
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Add new address")
    public ResponseEntity<ApiResponse> addAddress(
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to add address");
        AddressResponse response = addressService.addAddress(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address added successfully", response));
    }
    
    @PutMapping("/{addressId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Update address")
    public ResponseEntity<ApiResponse> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update address: {}", addressId);
        AddressResponse response = addressService.updateAddress(addressId, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", response));
    }
    
    @GetMapping("/{addressId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Get address by ID")
    public ResponseEntity<ApiResponse> getAddressById(
            @PathVariable Long addressId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get address: {}", addressId);
        AddressResponse response = addressService.getAddressById(addressId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Address found", response));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Get all addresses")
    public ResponseEntity<ApiResponse> getAllAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get all addresses");
        List<AddressResponse> addresses = addressService.getAllAddresses(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Addresses found", addresses));
    }
    
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Get active addresses")
    public ResponseEntity<ApiResponse> getActiveAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get active addresses");
        List<AddressResponse> addresses = addressService.getActiveAddresses(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Active addresses found", addresses));
    }
    
    @GetMapping("/type/{addressType}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Get addresses by type")
    public ResponseEntity<ApiResponse> getAddressesByType(
            @PathVariable String addressType,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get addresses by type: {}", addressType);
        List<AddressResponse> addresses = addressService.getAddressesByType(addressType, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Addresses found", addresses));
    }
    
    @GetMapping("/default")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Get default address")
    public ResponseEntity<ApiResponse> getDefaultAddress(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get default address");
        AddressResponse response = addressService.getDefaultAddress(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Default address found", response));
    }
    
    @PatchMapping("/{addressId}/default")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Set address as default")
    public ResponseEntity<ApiResponse> setDefaultAddress(
            @PathVariable Long addressId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to set default address: {}", addressId);
        addressService.setDefaultAddress(addressId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Default address set successfully", null));
    }
    
    @DeleteMapping("/{addressId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Delete address")
    public ResponseEntity<ApiResponse> deleteAddress(
            @PathVariable Long addressId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to delete address: {}", addressId);
        addressService.deleteAddress(addressId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }
    
    @DeleteMapping("/{addressId}/soft")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER')")
    @Operation(summary = "Soft delete address")
    public ResponseEntity<ApiResponse> softDeleteAddress(
            @PathVariable Long addressId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to soft delete address: {}", addressId);
        addressService.softDeleteAddress(addressId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Address soft deleted successfully", null));
    }
}
