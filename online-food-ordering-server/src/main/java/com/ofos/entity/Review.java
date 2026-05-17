package com.ofos.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review extends BaseEntity {
    
    @Column(nullable = false)
    private Integer rating; // 1 to 5 stars
    
    @Column(length = 2000)
    private String comment;
    
    @Enumerated(EnumType.STRING)
    private ReviewType reviewType; // RESTAURANT, DELIVERY_PARTNER
    
    private String reviewImages; // Comma separated image URLs
    
    private Boolean isVerified = false; // Verified purchase review
    
    private Boolean isApproved = false; // Approved by admin
    
    private Integer helpfulCount = 0;
    
    private Integer notHelpfulCount = 0;
    
    private LocalDateTime approvedAt;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;
    
    @ManyToOne
    @JoinColumn(name = "delivery_partner_id")
    private DeliveryPartner deliveryPartner;
    
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
    
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL)
    private List<ReviewReply> replies = new ArrayList<>();
    
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL)
    private List<ReviewHelpful> helpfulVotes = new ArrayList<>();
}