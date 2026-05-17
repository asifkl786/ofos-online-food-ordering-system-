package com.ofos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.ofos.dto.response.DeliveryPartnerResponse;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseEntity {
    
    @Column(unique = true, nullable = false)
    private String orderNumber;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal tax;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal deliveryFee;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal discount;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(precision = 5, scale = 2)
    private BigDecimal commissionRate;

    @Column(precision = 10, scale = 2)
    private BigDecimal platformCommission;

    @Column(precision = 10, scale = 2)
    private BigDecimal restaurantPayout;
    
    private String specialInstructions;
    
    private LocalDateTime deliveryTime;
    
    private LocalDateTime estimatedDeliveryTime;
    
    private LocalDateTime cancelledAt;
    
    private String cancellationReason;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;
    
    @ManyToOne
    @JoinColumn(name = "delivery_address_id")
    private Address deliveryAddress;
    
    @ManyToOne
    @JoinColumn(name = "delivery_partner_id")
    private User deliveryPartner;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();
    
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Payment payment;
    
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private OrderTracking tracking;

	public DeliveryPartnerResponse getCustomer() {
		// TODO Auto-generated method stub
		return null;
	}
}
