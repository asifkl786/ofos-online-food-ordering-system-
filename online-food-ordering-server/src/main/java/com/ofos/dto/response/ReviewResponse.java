package com.ofos.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private String reviewType;
    private String reviewImages;
    private Boolean isVerified;
    private Boolean isApproved;
    private Integer helpfulCount;
    private Integer notHelpfulCount;
    private LocalDateTime createdAt;
    
    // User info
    private Long userId;
    private String userName;
    private String userProfileImage;
    
    // Restaurant info (if applicable)
    private Long restaurantId;
    private String restaurantName;
    
    // Delivery partner info (if applicable)
    private Long deliveryPartnerId;
    private String deliveryPartnerName;
    
    // Order info
    private Long orderId;
    private String orderNumber;
    
    // Replies
    private List<ReviewReplyResponse> replies;
    
    // User's vote (if any)
    private Boolean userVotedHelpful;
}