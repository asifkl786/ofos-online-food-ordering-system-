package com.ofos.service;

import com.ofos.dto.request.PaymentCallbackRequest;
import com.ofos.dto.request.PaymentRequest;
import com.ofos.dto.request.RefundRequest;
import com.ofos.dto.response.PaymentInitResponse;
import com.ofos.dto.response.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {
    
    PaymentInitResponse initiatePayment(PaymentRequest request, String userEmail);
    
    PaymentResponse handlePaymentCallback(PaymentCallbackRequest callback);
    
    PaymentResponse getPaymentByOrderId(Long orderId);
    
    PaymentResponse getPaymentByTransactionId(String transactionId);

    Page<PaymentResponse> getAllPayments(Pageable pageable);
    
    Page<PaymentResponse> getUserPayments(String userEmail, Pageable pageable);
    
    PaymentResponse processRefund(RefundRequest request, String userEmail);
    
    PaymentResponse processCodPayment(Long orderId);
    
    void handleFailedPayment(Long paymentId, String failureReason);
}
