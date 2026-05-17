package com.ofos.controller;

import com.ofos.dto.request.PaymentCallbackRequest;
import com.ofos.dto.request.PaymentRequest;
import com.ofos.dto.request.RefundRequest;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.PaymentInitResponse;
import com.ofos.dto.response.PaymentResponse;
import com.ofos.service.PaymentService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Processing", description = "APIs for processing payments")
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @PostMapping("/initiate")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Initiate payment for an order")
    public ResponseEntity<ApiResponse> initiatePayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to initiate payment for order: {}", request.getOrderId());
        PaymentInitResponse response = paymentService.initiatePayment(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment initiated successfully", response));
    }
    
    @PostMapping("/webhook")
    @Operation(summary = "Payment gateway webhook callback")
    public ResponseEntity<ApiResponse> handlePaymentCallback(@RequestBody PaymentCallbackRequest callback) {
        log.info("REST request to handle payment callback");
        PaymentResponse response = paymentService.handlePaymentCallback(callback);
        return ResponseEntity.ok(ApiResponse.success("Payment callback processed", response));
    }
    
    @PostMapping("/cod/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Process Cash on Delivery payment")
    public ResponseEntity<ApiResponse> processCodPayment(@PathVariable Long orderId) {
        log.info("REST request to process COD payment for order: {}", orderId);
        PaymentResponse response = paymentService.processCodPayment(orderId);
        return ResponseEntity.ok(ApiResponse.success("COD payment processed", response));
    }
    
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Get payment by order ID")
    public ResponseEntity<ApiResponse> getPaymentByOrderId(@PathVariable Long orderId) {
        log.info("REST request to get payment for order: {}", orderId);
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success("Payment found", response));
    }
    
    @GetMapping("/transaction/{transactionId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get payment by transaction ID")
    public ResponseEntity<ApiResponse> getPaymentByTransactionId(@PathVariable String transactionId) {
        log.info("REST request to get payment by transaction: {}", transactionId);
        PaymentResponse response = paymentService.getPaymentByTransactionId(transactionId);
        return ResponseEntity.ok(ApiResponse.success("Payment found", response));
    }
    
    @GetMapping("/my-payments")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get current user's payment history")
    public ResponseEntity<ApiResponse> getUserPayments(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get user payments");
        Page<PaymentResponse> payments = paymentService.getUserPayments(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Payments found", payments));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all payments (Admin only)")
    public ResponseEntity<ApiResponse> getAllPayments(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get all payments for admin");
        Page<PaymentResponse> payments = paymentService.getAllPayments(pageable);
        return ResponseEntity.ok(ApiResponse.success("Payments found", payments));
    }
    
    @PostMapping("/refund")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Process refund (Admin only)")
    public ResponseEntity<ApiResponse> processRefund(
            @Valid @RequestBody RefundRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to process refund for payment: {}", request.getPaymentId());
        PaymentResponse response = paymentService.processRefund(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Refund processed successfully", response));
    }
}
