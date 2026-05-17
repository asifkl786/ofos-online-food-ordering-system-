package com.ofos.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ofos.dto.request.AddMoneyRequest;
import com.ofos.dto.request.WalletPaymentRequest;
import com.ofos.dto.request.WithdrawRequest;
import com.ofos.dto.response.AddMoneyResponse;
import com.ofos.dto.response.WalletResponse;
import com.ofos.dto.response.WalletTransactionResponse;
import com.ofos.entity.Order;
import com.ofos.entity.OrderStatus;
import com.ofos.entity.PaymentStatus;
import com.ofos.entity.TransactionMode;
import com.ofos.entity.TransactionStatus;
import com.ofos.entity.TransactionType;
import com.ofos.entity.NotificationType;
import com.ofos.entity.User;
import com.ofos.entity.Wallet;
import com.ofos.entity.WalletTransaction;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.OrderRepository;
import com.ofos.repository.UserRepository;
import com.ofos.repository.WalletRepository;
import com.ofos.repository.WalletTransactionRepository;
import com.ofos.service.NotificationService;
import com.ofos.service.WalletService;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletServiceImpl implements WalletService {
    
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ModelMapper modelMapper;
    private final NotificationService notificationService;
    @PersistenceContext
    private EntityManager entityManager;
    
    // ==================== Wallet Operations ====================
    
    @Override
    public WalletResponse getWallet(String userEmail) {
        log.debug("Fetching wallet for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user"));
        
        return convertToResponse(wallet);
    }
    
    @Override
    public BigDecimal getBalance(String userEmail) {
        log.debug("Getting balance for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        return walletRepository.getBalanceByUserId(user.getId());
    }
    
    @Override
    @Transactional
    public AddMoneyResponse addMoney(AddMoneyRequest request, String userEmail) {
        log.info("Adding money to wallet for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        Wallet wallet = getOrCreateWallet(user);
        
        // Generate transaction reference
        String transactionRef = generateTransactionRef();
        
        // Create transaction record
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionReference(transactionRef);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(TransactionType.CREDIT);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setMode(TransactionMode.valueOf(request.getPaymentMethod().toUpperCase()));
        transaction.setDescription("Added money to wallet via " + request.getPaymentMethod());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setWallet(wallet);
        
        transactionRepository.save(transaction);
        
        // In production, integrate with payment gateway here
        // For now, simulate successful payment
        processSuccessfulPayment(transaction, wallet);
        
        log.info("Money added successfully. Transaction: {}", transactionRef);
        safeNotify(user.getId(), "Wallet credited",
                "₹" + request.getAmount() + " added to your wallet via " + request.getPaymentMethod() + ".",
                NotificationType.PAYMENT_SUCCESS, null);
        
        return AddMoneyResponse.builder()
                .transactionReference(transactionRef)
                .amount(request.getAmount())
                .newBalance(wallet.getBalance())
                .status("SUCCESS")
                .build();
    }
    
    @Override
    @Transactional
    public WalletResponse payWithWallet(WalletPaymentRequest request, String userEmail) {
        log.info("Processing wallet payment for order: {}", request.getOrderId());
        
        User user = getUserByEmail(userEmail);
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Verify order belongs to user
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Order does not belong to user");
        }
        
        // Check if order can be paid
        if (order.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new BusinessException("Order payment is already processed");
        }
        
        Wallet wallet = getOrCreateWallet(user);
        
        // Check sufficient balance
        if (wallet.getBalance().compareTo(order.getTotalAmount()) < 0) {
            throw new BusinessException("Insufficient wallet balance. Available: " + 
                wallet.getBalance() + ", Required: " + order.getTotalAmount());
        }
        
        // Create debit transaction
        String transactionRef = generateTransactionRef();
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionReference(transactionRef);
        transaction.setAmount(order.getTotalAmount());
        transaction.setTransactionType(TransactionType.DEBIT);
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setMode(TransactionMode.ORDER_PAYMENT);
        transaction.setDescription("Payment for order #" + order.getOrderNumber());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setClosingBalance(wallet.getBalance().subtract(order.getTotalAmount()));
        transaction.setWallet(wallet);
        transaction.setOrder(order);
        
        // Debit from wallet
        int updated = walletRepository.debitBalance(wallet.getId(), order.getTotalAmount());
        if (updated == 0) {
            throw new BusinessException("Failed to debit wallet. Insufficient balance.");
        }
        
        transactionRepository.save(transaction);
        
        // Update order payment status
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        
        log.info("Wallet payment successful for order: {}", order.getOrderNumber());
        safeNotify(user.getId(), "Wallet payment successful",
                "₹" + order.getTotalAmount() + " paid from wallet for order #" + order.getOrderNumber() + ".",
                NotificationType.PAYMENT_SUCCESS, order.getId());
        
        return convertToResponse(wallet);
    }
    
    @Override
    @Transactional
    public WalletResponse processRefund(Long orderId, BigDecimal amount) {
        log.info("Processing refund of {} for order: {}", amount, orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        User user = order.getUser();
        Wallet wallet = getOrCreateWallet(user);
        
        // Create credit transaction
        String transactionRef = generateTransactionRef();
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionReference(transactionRef);
        transaction.setTransactionType(TransactionType.CREDIT);
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setMode(TransactionMode.REFUND);
        transaction.setDescription("Refund for cancelled order #" + order.getOrderNumber());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setAmount(amount);
        transaction.setWallet(wallet);
        transaction.setOrder(order);
        
        // Credit to wallet
        walletRepository.creditBalance(wallet.getId(), amount);
        transaction.setClosingBalance(wallet.getBalance().add(amount));
        
        transactionRepository.save(transaction);
        
        log.info("Refund processed successfully to wallet");
        safeNotify(user.getId(), "Refund processed",
                "₹" + amount + " refunded to your wallet for order #" + order.getOrderNumber() + ".",
                NotificationType.REFUND_PROCESSED, order.getId());
        
        return convertToResponse(wallet);
    }
    
    // ==================== Transaction History ====================
    
    @Override
    public Page<WalletTransactionResponse> getTransactionHistory(String userEmail, Pageable pageable) {
        log.debug("Fetching transaction history for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        Wallet wallet = getOrCreateWallet(user);
        
        return transactionRepository.findByWalletIdOrderByTransactionDateDesc(wallet.getId(), pageable)
                .map(this::convertToTransactionResponse);
    }

    @Override
    public Page<WalletTransactionResponse> getAllTransactions(Pageable pageable) {
        log.debug("Fetching all wallet transactions for admin");
        return transactionRepository.findAllByOrderByTransactionDateDesc(pageable)
                .map(this::convertToTransactionResponse);
    }
    
    @Override
    public WalletTransactionResponse getTransactionByReference(String reference) {
        log.debug("Fetching transaction by reference: {}", reference);
        
        WalletTransaction transaction = transactionRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        
        return convertToTransactionResponse(transaction);
    }
    
    // ==================== Withdrawal ====================
    
    @Override
    @Transactional
    public WalletResponse requestWithdrawal(WithdrawRequest request, String userEmail) {
        log.info("Processing withdrawal request for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        Wallet wallet = getOrCreateWallet(user);
        
        // Check minimum withdrawal amount
        if (request.getAmount().compareTo(BigDecimal.valueOf(100)) < 0) {
            throw new BusinessException("Minimum withdrawal amount is ₹100");
        }
        
        // Check balance
        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException("Insufficient balance");
        }
        
        // Create withdrawal transaction
        String transactionRef = generateTransactionRef();
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionReference(transactionRef);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(TransactionType.DEBIT);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setMode(TransactionMode.UPI); // or BANK_TRANSFER
        transaction.setDescription("Withdrawal request via " + 
            (request.getUpiId() != null ? "UPI: " + request.getUpiId() : "Bank Transfer"));
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setWallet(wallet);
        
        // Hold amount (debit temporarily)
        walletRepository.debitBalance(wallet.getId(), request.getAmount());
        transaction.setClosingBalance(wallet.getBalance().subtract(request.getAmount()));
        
        transactionRepository.save(transaction);
        
        log.info("Withdrawal request submitted. Transaction: {}", transactionRef);
        
        return convertToResponse(wallet);
    }
    
    // ==================== Admin Operations ====================
    
    @Override
    @Transactional
    public void addCashback(Long userId, BigDecimal amount, String reason) {
        log.info("Adding cashback of {} to user: {}", amount, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Wallet wallet = getOrCreateWallet(user);
        
        String transactionRef = generateTransactionRef();
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionReference(transactionRef);
        transaction.setAmount(amount);
        transaction.setTransactionType(TransactionType.CREDIT);
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setMode(TransactionMode.CASHBACK);
        transaction.setDescription("Cashback: " + reason);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setWallet(wallet);
        
        walletRepository.creditBalance(wallet.getId(), amount);
        transaction.setClosingBalance(wallet.getBalance().add(amount));
        
        transactionRepository.save(transaction);
        
        log.info("Cashback added successfully");
        safeNotify(user.getId(), "Cashback received",
                "₹" + amount + " cashback added to your wallet. Reason: " + reason,
                NotificationType.PROMOTION, null);
    }
    
    @Override
    @Transactional
    public void processFailedTransactions() {
        log.info("Processing failed transactions");
        
        List<WalletTransaction> failedTransactions = transactionRepository
                .findByStatusAndCreatedAtBefore(TransactionStatus.PENDING, 
                    LocalDateTime.now().minusMinutes(30));
        
        for (WalletTransaction transaction : failedTransactions) {
            transaction.setStatus(TransactionStatus.FAILED);
            transaction.setFailureReason("Transaction timeout");
            transactionRepository.save(transaction);
            
            // Reverse the hold if any
            if (transaction.getTransactionType() == TransactionType.DEBIT) {
                walletRepository.creditBalance(transaction.getWallet().getId(), transaction.getAmount());
            }
        }
        
        log.info("Processed {} failed transactions", failedTransactions.size());
    }
    
    // ==================== Helper Methods ====================
    
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    private Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    log.info("Creating new wallet for user: {}", user.getId());
                    Wallet newWallet = new Wallet();
                    newWallet.setUser(user);
                    newWallet.setBalance(BigDecimal.ZERO);
                    newWallet.setTotalCredited(BigDecimal.ZERO);
                    newWallet.setTotalDebited(BigDecimal.ZERO);
                    newWallet.setTotalTransactions(0);
                    newWallet.setIsActive(true);
                    return walletRepository.save(newWallet);
                });
    }
    
    private void processSuccessfulPayment(WalletTransaction transaction, Wallet wallet) {
        // Simulate successful payment gateway response
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setPaymentGatewayTransactionId("PG_" + System.currentTimeMillis());
        transaction.setClosingBalance(wallet.getBalance().add(transaction.getAmount()));
        transactionRepository.save(transaction);
        
        // Credit to wallet
        walletRepository.creditBalance(wallet.getId(), transaction.getAmount());
        // Refresh after the bulk update so callers see the new balance in the same request.
        entityManager.refresh(wallet);
    }

    private void safeNotify(Long userId, String title, String message, NotificationType type, Long orderId) {
        try {
            notificationService.createInAppNotification(userId, title, message, type, orderId);
        } catch (Exception e) {
            log.warn("Wallet notification skipped: {}", e.getMessage());
        }
    }
    
    private String generateTransactionRef() {
        return "WLT_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
    
    private WalletResponse convertToResponse(Wallet wallet) {
        WalletResponse response = modelMapper.map(wallet, WalletResponse.class);
        response.setUserId(wallet.getUser().getId());
        response.setUserName(wallet.getUser().getFirstName() + " " + wallet.getUser().getLastName());
        response.setUserEmail(wallet.getUser().getEmail());
        return response;
    }
    
    private WalletTransactionResponse convertToTransactionResponse(WalletTransaction transaction) {
        WalletTransactionResponse response = modelMapper.map(transaction, WalletTransactionResponse.class);
        
        if (transaction.getOrder() != null) {
            response.setOrderId(transaction.getOrder().getId());
            response.setOrderNumber(transaction.getOrder().getOrderNumber());
        }
        
        response.setTransactionType(transaction.getTransactionType().toString());
        response.setStatus(transaction.getStatus().toString());
        response.setMode(transaction.getMode().toString());
        
        return response;
    }
}
