package com.ofos.service;

import com.ofos.dto.request.AddMoneyRequest;
import com.ofos.dto.request.WalletPaymentRequest;
import com.ofos.dto.request.WithdrawRequest;
import com.ofos.dto.response.AddMoneyResponse;
import com.ofos.dto.response.WalletResponse;
import com.ofos.dto.response.WalletTransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface WalletService {
    
    // Wallet Operations
    WalletResponse getWallet(String userEmail);
    
    BigDecimal getBalance(String userEmail);
    
    AddMoneyResponse addMoney(AddMoneyRequest request, String userEmail);
    
    WalletResponse payWithWallet(WalletPaymentRequest request, String userEmail);
    
    WalletResponse processRefund(Long orderId, BigDecimal amount);
    
    // Transaction History
    Page<WalletTransactionResponse> getTransactionHistory(String userEmail, Pageable pageable);

    Page<WalletTransactionResponse> getAllTransactions(Pageable pageable);
    
    WalletTransactionResponse getTransactionByReference(String reference);
    
    // Withdrawal
    WalletResponse requestWithdrawal(WithdrawRequest request, String userEmail);
    
    // Admin Operations
    void addCashback(Long userId, BigDecimal amount, String reason);
    
    void processFailedTransactions();
}
