package com.ofos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "users")
@Data
public class User extends BaseEntity {
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String firstName;
    
    private String lastName;
    
    @Column(unique = true)
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    private String profileImageUrl;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Cart cart;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Address> addresses = new ArrayList<>();
    
    @OneToMany(mappedBy = "user")
    private List<Order> orders = new ArrayList<>();
    
    @OneToMany(mappedBy = "user")
    private List<Review> reviews = new ArrayList<>();
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Wallet wallet;
    
    @OneToMany(mappedBy = "owner")
    private List<Restaurant> ownedRestaurants = new ArrayList<>();
    
    @OneToMany(mappedBy = "deliveryPartner")
    private List<Order> deliveryOrders = new ArrayList<>();
    
}

	