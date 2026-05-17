package com.ofos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "restaurants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant extends BaseEntity {
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    private String logoUrl;
    
    private String coverImageUrl;
    
    @Column(nullable = false)
    private String cuisineType;
    
    private BigDecimal minimumOrderAmount;
    
    private BigDecimal deliveryFee;
    
    private LocalTime openingTime;
    
    private LocalTime closingTime;
    
    @Column(nullable = false)
    private Boolean isOpen = true;
    
    private Boolean isActive = true;
    
    private Boolean isVerified = false;
    
    private Double averageRating = 0.0;
    
    private Integer totalReviews = 0;
    
    private Integer totalOrders = 0;
    
    private String contactPhone;
    
    private String contactEmail;
    
    private String website;
    
    private String gstNumber;
    
    private String fssaiLicenseNumber; // Food license
    
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MenuItem> menuItems = new ArrayList<>();
    
    @OneToMany(mappedBy = "restaurant")
    private List<Order> orders = new ArrayList<>();
    
    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RestaurantAddress> addresses = new ArrayList<>();
    
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    @OneToMany(mappedBy = "restaurant")
    private List<Review> reviews = new ArrayList<>();
}