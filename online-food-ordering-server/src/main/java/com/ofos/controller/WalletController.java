package com.ofos.controller;

import com.ofos.dto.request.AddMoneyRequest;
import com.ofos.dto.request.WalletPaymentRequest;
import com.ofos.dto.request.WithdrawRequest;
import com.ofos.dto.response.AddMoneyResponse;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.WalletResponse;
import com.ofos.dto.response.WalletTransactionResponse;
import com.ofos.service.WalletService;
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

import java.math.BigDecimal;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Wallet Management", description = "APIs for managing digital wallet")
public class WalletController {
    
    private final WalletService walletService;
    // Wallet belongs to the logged-in account, so every authenticated business role can manage its own balance.
    private static final String WALLET_USER_ROLES = "hasAnyRole('CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_PARTNER', 'ADMIN')";
    
    // ==================== Wallet Operations ====================
    
    @GetMapping
    @PreAuthorize(WALLET_USER_ROLES)
    @Operation(summary = "Get wallet details")
    public ResponseEntity<ApiResponse> getWallet(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get wallet");
        WalletResponse response = walletService.getWallet(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Wallet found", response));
    }
    
    @GetMapping("/balance")
    @PreAuthorize(WALLET_USER_ROLES)
    @Operation(summary = "Get wallet balance")
    public ResponseEntity<ApiResponse> getBalance(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to get wallet balance");
        BigDecimal balance = walletService.getBalance(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Balance retrieved", balance));
    }
    
    @PostMapping("/add-money")
    @PreAuthorize(WALLET_USER_ROLES)
    @Operation(summary = "Add money to wallet")
    public ResponseEntity<ApiResponse> addMoney(
            @Valid @RequestBody AddMoneyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to add money to wallet");
        AddMoneyResponse response = walletService.addMoney(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Money added successfully", response));
    }
    
    @PostMapping("/pay")
    @PreAuthorize(WALLET_USER_ROLES)
    @Operation(summary = "Pay for order using wallet")
    public ResponseEntity<ApiResponse> payWithWallet(
            @Valid @RequestBody WalletPaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to pay with wallet for order: {}", request.getOrderId());
        WalletResponse response = walletService.payWithWallet(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Payment successful", response));
    }
    
    // ==================== Transaction History ====================
    
    @GetMapping("/transactions")
    @PreAuthorize(WALLET_USER_ROLES)
    @Operation(summary = "Get transaction history")
    public ResponseEntity<ApiResponse> getTransactionHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "transactionDate", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get transaction history");
        Page<WalletTransactionResponse> transactions = walletService.getTransactionHistory(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Transactions found", transactions));
    }

    @GetMapping("/admin/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all wallet transactions (Admin only)")
    public ResponseEntity<ApiResponse> getAllTransactions(
            @PageableDefault(size = 10, sort = "transactionDate", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get all wallet transactions for admin");
        Page<WalletTransactionResponse> transactions = walletService.getAllTransactions(pageable);
        return ResponseEntity.ok(ApiResponse.success("Transactions found", transactions));
    }
    
    @GetMapping("/transactions/{reference}")
    @PreAuthorize(WALLET_USER_ROLES)
    @Operation(summary = "Get transaction by reference")
    public ResponseEntity<ApiResponse> getTransactionByReference(@PathVariable String reference) {
        log.info("REST request to get transaction by reference: {}", reference);
        WalletTransactionResponse response = walletService.getTransactionByReference(reference);
        return ResponseEntity.ok(ApiResponse.success("Transaction found", response));
    }
    
    // ==================== Withdrawal ====================
    
    @PostMapping("/withdraw")
    @PreAuthorize(WALLET_USER_ROLES)
    @Operation(summary = "Request withdrawal from wallet")
    public ResponseEntity<ApiResponse> requestWithdrawal(
            @Valid @RequestBody WithdrawRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to withdraw from wallet");
        WalletResponse response = walletService.requestWithdrawal(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Withdrawal request submitted", response));
    }
    
    // ==================== Admin Operations ====================
    
    @PostMapping("/admin/cashback")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add cashback to user (Admin only)")
    public ResponseEntity<ApiResponse> addCashback(
            @RequestParam Long userId,
            @RequestParam BigDecimal amount,
            @RequestParam String reason) {
        log.info("REST request to add cashback to user: {}", userId);
        walletService.addCashback(userId, amount, reason);
        return ResponseEntity.ok(ApiResponse.success("Cashback added successfully", null));
    }
}
