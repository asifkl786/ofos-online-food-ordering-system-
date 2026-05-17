package com.ofos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder  // ✅ ADD THIS - Builder pattern for easy object creation
public class Address extends BaseEntity {
    
    @Column(nullable = false)
    private String streetAddress;
    
    private String apartmentNumber;
    
    @Column(nullable = false)
    private String city;
    
    @Column(nullable = false)
    private String state;
    
    @Column(nullable = false)
    private String zipCode;
    
    @Column(nullable = false)
    private String country;
    
    private String landmark;
    
    @Column(nullable = false)
    private String addressType; // HOME, WORK, OTHER
    
    private Double latitude;
    
    private Double longitude;
    
    private String phoneNumber; // Alternative phone for delivery
    
    private String receiverName; // Name of person receiving order
    
    @Column(nullable = false)
    private Boolean isDefault = false;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @OneToMany(mappedBy = "deliveryAddress")
    private java.util.List<Order> orders;
}