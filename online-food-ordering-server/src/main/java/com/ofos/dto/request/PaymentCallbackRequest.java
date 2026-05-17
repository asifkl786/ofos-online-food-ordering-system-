package com.ofos.dto.request;

import lombok.Data;

@Data
public class PaymentCallbackRequest {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private String paymentId;
    private String orderId;
    private String status;
    private String signature;
}