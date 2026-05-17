package com.ofos.controller;

import com.ofos.dto.request.DeliveryAssignmentRequest;
import com.ofos.dto.request.OrderRequest;
import com.ofos.dto.request.OrderStatusUpdateRequest;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.OrderResponse;
import com.ofos.dto.response.OrderSummaryResponse;
import com.ofos.entity.OrderStatus;
import com.ofos.exception.BusinessException;
import com.ofos.service.OrderService;
import com.ofos.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Order Management", description = "APIs for managing orders")
public class OrderController {
    
    private final OrderService orderService;
    private final InvoiceService invoiceService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Create new order from cart")
    public ResponseEntity<ApiResponse> createOrder(
            @Valid @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to create order");
        OrderResponse response = orderService.createOrder(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", response));
    }
    
    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER', 'ADMIN')")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse> getOrderById(@PathVariable Long orderId) {
        log.info("REST request to get order by id: {}", orderId);
        OrderResponse response = orderService.getOrderById(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order found", response));
    }

    @GetMapping(value = "/{orderId}/invoice", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Download restaurant order invoice PDF")
    public ResponseEntity<byte[]> downloadOrderInvoice(@PathVariable Long orderId) {
        log.info("REST request to download order invoice: {}", orderId);
        byte[] pdf = invoiceService.generateOrderInvoicePdf(orderId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=order-invoice-" + orderId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
    
    @GetMapping("/number/{orderNumber}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER', 'ADMIN')")
    @Operation(summary = "Get order by order number")
    public ResponseEntity<ApiResponse> getOrderByNumber(@PathVariable String orderNumber) {
        log.info("REST request to get order by number: {}", orderNumber);
        OrderResponse response = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.success("Order found", response));
    }
    
    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get current user's orders")
    public ResponseEntity<ApiResponse> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get my orders");
        Page<OrderResponse> orders = orderService.getUserOrders(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Orders found", orders));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders (Admin only)")
    public ResponseEntity<ApiResponse> getAllOrders(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get all orders");
        Page<OrderResponse> orders = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success("Orders found", orders));
    }
    
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get order history summary")
    public ResponseEntity<ApiResponse> getOrderHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get order history");
        Page<OrderSummaryResponse> history = orderService.getOrderHistory(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Order history found", history));
    }
    
    @GetMapping("/owner")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    @Operation(summary = "Get all orders for the logged-in restaurant owner")
    public ResponseEntity<ApiResponse> getOwnerOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get owner orders for: {}", userDetails.getUsername());
        Page<OrderResponse> orders = orderService.getOwnerOrders(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Owner orders found", orders));
    }
    
    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Get restaurant orders")
    public ResponseEntity<ApiResponse> getRestaurantOrders(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get orders for restaurant: {}", restaurantId);
        Page<OrderResponse> orders = orderService.getRestaurantOrders(restaurantId, pageable, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Orders found", orders));
    }
    
    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody(required = false) OrderStatusUpdateRequest request,
            @RequestParam(required = false) OrderStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Support both JSON body and status query param for admin tools and API clients.
        OrderStatusUpdateRequest resolvedRequest = request != null ? request : new OrderStatusUpdateRequest();
        if (resolvedRequest.getStatus() == null) {
            resolvedRequest.setStatus(status);
        }
        if (resolvedRequest.getStatus() == null) {
            throw new BusinessException("Order status is required");
        }

        log.info("REST request to update order status: {} for order: {}", resolvedRequest.getStatus(), orderId);
        OrderResponse response = orderService.updateOrderStatus(orderId, resolvedRequest, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", response));
    }
    
    @PostMapping("/{orderId}/assign-delivery")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Assign delivery partner to order")
    public ResponseEntity<ApiResponse> assignDeliveryPartner(
            @PathVariable Long orderId,
            @Valid @RequestBody DeliveryAssignmentRequest request) {
        log.info("REST request to assign delivery partner to order: {}", orderId);
        OrderResponse response = orderService.assignDeliveryPartner(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Delivery partner assigned successfully", response));
    }
    
    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Cancel order")
    public ResponseEntity<ApiResponse> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam String cancellationReason,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to cancel order: {}", orderId);
        OrderResponse response = orderService.cancelOrder(orderId, cancellationReason, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", response));
    }
    
    @GetMapping("/active-count")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get active orders count")
    public ResponseEntity<ApiResponse> getActiveOrdersCount(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get active orders count");
        Long count = orderService.getActiveOrdersCount(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Active orders count retrieved", count));
    }
}









