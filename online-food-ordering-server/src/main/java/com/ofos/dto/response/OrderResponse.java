package com.ofos.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal deliveryFee;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private BigDecimal commissionRate;
    private BigDecimal platformCommission;
    private BigDecimal restaurantPayout;
    private LocalDateTime createdAt;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime deliveredAt;
    private String specialInstructions;
    private String cancellationReason;
    
    // Nested objects
    private UserInfoResponse user;
    private RestaurantInfoResponse restaurant;
    private AddressResponse deliveryAddress;
    private DeliveryInfoResponse deliveryInfo;
    private List<OrderItemResponse> items;
}
