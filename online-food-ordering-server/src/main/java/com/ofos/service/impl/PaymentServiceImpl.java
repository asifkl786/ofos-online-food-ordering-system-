package com.ofos.service.impl;

import com.ofos.dto.request.PaymentCallbackRequest;
import com.ofos.dto.request.PaymentRequest;
import com.ofos.dto.request.RefundRequest;
import com.ofos.dto.response.PaymentInitResponse;
import com.ofos.dto.response.PaymentResponse;
import com.ofos.entity.*;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.OrderRepository;
import com.ofos.repository.PaymentRepository;
import com.ofos.repository.UserRepository;
import com.ofos.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    
    @Value("${razorpay.key.id:}")
    private String razorpayKeyId;
    
    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret;
    
    @Override
    @Transactional
    public PaymentInitResponse initiatePayment(PaymentRequest request, String userEmail) {
        log.info("Initiating payment for order: {}", request.getOrderId());
        
        // Get order
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Verify order belongs to user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Order does not belong to user");
        }
        
        // Check if payment already exists
        if (paymentRepository.findByOrderId(order.getId()).isPresent()) {
            throw new BusinessException("Payment already initiated for this order");
        }
        
        // For COD, directly mark as success
        if (request.getPaymentMethod() == PaymentMethod.CASH_ON_DELIVERY) {
            return processCodPaymentInit(order);
        }
        
        // Create payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPaymentGateway("RAZORPAY");
        
        // Generate payment order ID (in real scenario, call Razorpay API)
        String paymentOrderId = generatePaymentOrderId();
        payment.setPaymentOrderId(paymentOrderId);
        
        paymentRepository.save(payment);
        
        // Update order payment status
        order.setPaymentStatus(PaymentStatus.PENDING);
        // Mirror the chosen payment method on the order for order-detail/tracking responses.
        order.setPaymentMethod(request.getPaymentMethod());
        orderRepository.save(order);
        
        // Build response
        return PaymentInitResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .amount(order.getTotalAmount())
                .paymentOrderId(paymentOrderId)
                .razorpayKeyId(razorpayKeyId)
                .paymentPageUrl(generatePaymentPageUrl(paymentOrderId, order.getTotalAmount()))
                .build();
    }
    
    @Override
    @Transactional
    public PaymentResponse handlePaymentCallback(PaymentCallbackRequest callback) {
        log.info("Handling payment callback for order: {}", callback.getOrderId());
        
        // Verify signature (in production, verify webhook signature)
        boolean isValid = verifyPaymentSignature(callback);
        
        if (!isValid) {
            log.error("Invalid payment signature for order: {}", callback.getOrderId());
            throw new BusinessException("Invalid payment signature");
        }
        
        Payment payment = paymentRepository.findByPaymentOrderId(callback.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        
        Order order = payment.getOrder();
        
        if ("SUCCESS".equalsIgnoreCase(callback.getStatus())) {
            // Payment successful
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId(callback.getRazorpayPaymentId());
            payment.setPaymentDate(LocalDateTime.now());
            payment.setPaymentSignature(callback.getRazorpaySignature());
            
            order.setPaymentStatus(PaymentStatus.SUCCESS);
            
            log.info("Payment successful for order: {}", order.getOrderNumber());
            
        } else {
            // Payment failed
            payment.setPaymentStatus(PaymentStatus.FAILED);
            order.setPaymentStatus(PaymentStatus.FAILED);
            
            log.warn("Payment failed for order: {}", order.getOrderNumber());
        }
        
        paymentRepository.save(payment);
        orderRepository.save(order);
        
        return convertToResponse(payment);
    }
    
    @Override
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        log.debug("Fetching payment for order: {}", orderId);
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
        return convertToResponse(payment);
    }
    
    @Override
    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        log.debug("Fetching payment by transaction: {}", transactionId);
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for transaction: " + transactionId));
        return convertToResponse(payment);
    }

    @Override
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        log.debug("Fetching all payments for admin");
        return paymentRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    public Page<PaymentResponse> getUserPayments(String userEmail, Pageable pageable) {
        log.debug("Fetching payments for user: {}", userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return paymentRepository.findByOrderUserId(user.getId(), pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    @Transactional
    public PaymentResponse processRefund(RefundRequest request, String userEmail) {
        log.info("Processing refund for payment: {}", request.getPaymentId());
        
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        
        // Check if payment can be refunded
        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new BusinessException("Only successful payments can be refunded");
        }
        
        // Check refund amount
        if (request.getRefundAmount().compareTo(payment.getAmount()) > 0) {
            throw new BusinessException("Refund amount cannot exceed payment amount");
        }
        
        // Process refund (in production, call Razorpay refund API)
        payment.setPaymentStatus(
            request.getRefundAmount().compareTo(payment.getAmount()) == 0 ? 
            PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED
        );
        payment.setRefundAmount(request.getRefundAmount());
        payment.setRefundDate(LocalDateTime.now());
        payment.setRefundReason(request.getRefundReason());
        
        // Update order payment status
        Order order = payment.getOrder();
        order.setPaymentStatus(payment.getPaymentStatus());
        orderRepository.save(order);
        
        Payment updatedPayment = paymentRepository.save(payment);
        log.info("Refund processed successfully for payment: {}", payment.getId());
        
        return convertToResponse(updatedPayment);
    }
    
    @Override
    @Transactional
    public PaymentResponse processCodPayment(Long orderId) {
        log.info("Processing COD payment for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId("COD_" + System.currentTimeMillis());
        
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        
        paymentRepository.save(payment);
        orderRepository.save(order);
        
        log.info("COD payment processed for order: {}", order.getOrderNumber());
        
        return convertToResponse(payment);
    }
    
    @Override
    @Transactional
    public void handleFailedPayment(Long paymentId, String failureReason) {
        log.info("Handling failed payment: {}", paymentId);
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        
        payment.setPaymentStatus(PaymentStatus.FAILED);
        payment.setPaymentResponse(failureReason);
        
        Order order = payment.getOrder();
        order.setPaymentStatus(PaymentStatus.FAILED);
        
        paymentRepository.save(payment);
        orderRepository.save(order);
    }
    
    // Private Helper Methods
    
    private PaymentInitResponse processCodPaymentInit(Order order) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY);
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPaymentGateway("COD");
        payment.setTransactionId("COD_" + System.currentTimeMillis());
        paymentRepository.save(payment);

        // COD also needs a method on the order so the user never sees a blank payment method.
        order.setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY);
        order.setPaymentStatus(PaymentStatus.PENDING);
        orderRepository.save(order);
        
        return PaymentInitResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .amount(order.getTotalAmount())
                .paymentOrderId("COD_" + order.getId())
                .build();
    }
    
    private String generatePaymentOrderId() {
        return "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 15);
    }
    
    private String generatePaymentPageUrl(String paymentOrderId, BigDecimal amount) {
        // In production, this would be Razorpay checkout URL
        return "https://checkout.razorpay.com/v1/checkout.js?order_id=" + paymentOrderId;
    }
    
    private boolean verifyPaymentSignature(PaymentCallbackRequest callback) {
        // In production, implement proper signature verification
        // using Razorpay's signature verification
        return true;
    }
    
    private PaymentResponse convertToResponse(Payment payment) {
        PaymentResponse response = modelMapper.map(payment, PaymentResponse.class);
        response.setOrderId(payment.getOrder().getId());
        response.setOrderNumber(payment.getOrder().getOrderNumber());
        return response;
    }
}
