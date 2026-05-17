package com.ofos.dto.request;

import com.ofos.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {
    
    @NotNull(message = "Order ID is required")
    private Long orderId;
    
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
    
    private String cardNumber;
    private String cardExpiry;
    private String cardCvv;
    private String upiId;
    private String bankCode;
    
    private String couponCode;
}
