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
@Table(name = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem extends BaseEntity {
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    private Integer preparationTime; // in minutes
    
    private String imageUrl;
    
    private Boolean isAvailable = true;
    
    private Boolean isVegetarian = false;
    
    private Boolean isVegan = false;
    
    private Boolean isGlutenFree = false;
    
    private Boolean isSpicy = false;
    
    private Integer calories;
    
    private Integer discountPercentage = 0;
    
    private Integer maxOrderQuantity = 10;
    
    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL)
    private List<CartItem> cartItems = new ArrayList<>();
    
    @OneToMany(mappedBy = "menuItem")
    private List<OrderItem> orderItems = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "menu_item_addons")
    private List<String> availableAddons = new ArrayList<>();
    
    @ElementCollection
    @CollectionTable(name = "menu_item_images")
    private List<String> additionalImages = new ArrayList<>();
}