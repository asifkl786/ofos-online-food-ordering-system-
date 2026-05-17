package com.ofos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "carts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart extends BaseEntity {
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<CartItem> items = new ArrayList<>();
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private Integer totalItems = 0;
    
    @Column(nullable = true)
    private Long restaurantId; // Track which restaurant's items are in cart
    
    @Column(nullable = true)
    private String restaurantName;
    
    private BigDecimal deliveryFee = BigDecimal.ZERO;
    
    private BigDecimal tax = BigDecimal.ZERO;
    
    private BigDecimal grandTotal = BigDecimal.ZERO;
}