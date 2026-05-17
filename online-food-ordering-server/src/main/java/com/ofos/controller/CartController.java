package com.ofos.controller;

import com.ofos.dto.request.AddToCartRequest;
import com.ofos.dto.request.UpdateCartItemRequest;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.CartResponse;
import com.ofos.service.CartService;
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

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Cart Management", description = "APIs for managing shopping cart")
public class CartController {
    
    private final CartService cartService;
    
    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<ApiResponse> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to add item to cart");
        CartResponse response = cartService.addToCart(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item added to cart successfully", response));
    }
    
    @PutMapping("/update")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse> updateCartItem(
            @Valid @RequestBody UpdateCartItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update cart item");
        CartResponse response = cartService.updateCartItem(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cart updated successfully", response));
    }
    
    @DeleteMapping("/remove/{cartItemId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse> removeFromCart(
            @PathVariable Long cartItemId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to remove item from cart: {}", cartItemId);
        CartResponse response = cartService.removeFromCart(cartItemId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart successfully", response));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get user cart")
    public ResponseEntity<ApiResponse> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get cart");
        CartResponse response = cartService.getCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", response));
    }
    
    @DeleteMapping("/clear")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Clear entire cart")
    public ResponseEntity<ApiResponse> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to clear cart");
        CartResponse response = cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", response));
    }
    
    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get cart item count")
    public ResponseEntity<ApiResponse> getCartItemCount(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get cart item count");
        Integer count = cartService.getCartItemCount(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cart item count retrieved", count));
    }
    
    @PostMapping("/validate")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Validate cart before checkout")
    public ResponseEntity<ApiResponse> validateCart(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to validate cart");
        cartService.validateCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Cart is valid", null));
    }
}
