package com.ofos.service.impl;

import com.ofos.dto.request.HelpfulVoteRequest;
import com.ofos.dto.request.ReviewReplyRequest;
import com.ofos.dto.request.ReviewRequest;
import com.ofos.dto.request.ReviewUpdateRequest;
import com.ofos.dto.response.RatingSummaryResponse;
import com.ofos.dto.response.ReviewReplyResponse;
import com.ofos.dto.response.ReviewResponse;
import com.ofos.entity.*;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.*;
import com.ofos.service.NotificationService;
import com.ofos.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final ReviewReplyRepository replyRepository;
    private final ReviewHelpfulRepository helpfulRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final OrderRepository orderRepository;
    private final ModelMapper modelMapper;
    private final NotificationService notificationService;
    
    // ==================== Review CRUD ====================
    
    @Override
    @Transactional
    public ReviewResponse addReview(ReviewRequest request, String userEmail) {
        log.info("Adding new review by user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        
        // Check if user can review (must have completed order)
        if (request.getOrderId() != null && !canUserReview(request.getOrderId(), userEmail)) {
            throw new BusinessException("You can only review orders that have been delivered");
        }
        
        // Check if already reviewed
        if (request.getOrderId() != null) {
            boolean alreadyReviewed = reviewRepository.existsByOrderIdAndUserId(request.getOrderId(), user.getId());
            if (alreadyReviewed) {
                throw new BusinessException("You have already reviewed this order");
            }
        }
        
        Review review = new Review();
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setReviewType(request.getReviewType());
        review.setReviewImages(request.getReviewImages());
        review.setUser(user);
        review.setIsVerified(true);
        review.setIsApproved(true); // Customer order reviews are visible immediately after delivered-order validation.
        review.setHelpfulCount(0);
        review.setNotHelpfulCount(0);
        
        if (request.getOrderId() != null) {
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
            review.setOrder(order);
        }
        
        if (request.getReviewType() == ReviewType.RESTAURANT && request.getRestaurantId() != null) {
            Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
            review.setRestaurant(restaurant);
        } else if (request.getReviewType() == ReviewType.DELIVERY_PARTNER && request.getDeliveryPartnerId() != null) {
            DeliveryPartner partner = deliveryPartnerRepository.findById(request.getDeliveryPartnerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found"));
            review.setDeliveryPartner(partner);
        }
        
        Review savedReview = reviewRepository.save(review);
        log.info("Review added successfully with id: {}", savedReview.getId());
        // Notify the business owner/rider after a review is saved so they can respond from their dashboard.
        createReviewNotification(savedReview);
        
        return convertToResponse(savedReview);
    }
    
    @Override
    public ReviewResponse getReviewById(Long reviewId) {
        log.debug("Fetching review by id: {}", reviewId);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        return convertToResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewUpdateRequest request, String userEmail) {
        log.info("Updating review: {}", reviewId);

        User user = getUserByEmail(userEmail);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        // Only the customer who wrote the review, or an admin, can edit the review content.
        boolean isOwner = review.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new BusinessException("You are not authorized to update this review");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setReviewImages(request.getReviewImages());
        review.setIsApproved(true); // Edited customer reviews remain visible after ownership validation.

        Review updatedReview = reviewRepository.save(review);

        // Keep aggregate ratings accurate immediately after an edit.
        if (updatedReview.getReviewType() == ReviewType.RESTAURANT && updatedReview.getRestaurant() != null) {
            updateRestaurantRating(updatedReview.getRestaurant().getId());
        } else if (updatedReview.getReviewType() == ReviewType.DELIVERY_PARTNER && updatedReview.getDeliveryPartner() != null) {
            updateDeliveryPartnerRating(updatedReview.getDeliveryPartner().getId());
        }

        return convertToResponse(updatedReview);
    }
    
    @Override
    public Page<ReviewResponse> getRestaurantReviews(Long restaurantId, Pageable pageable) {
        log.debug("Fetching reviews for restaurant: {}", restaurantId);
        return reviewRepository.findByRestaurantIdAndIsApprovedTrue(restaurantId, pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    public Page<ReviewResponse> getDeliveryPartnerReviews(Long partnerId, Pageable pageable) {
        log.debug("Fetching reviews for delivery partner: {}", partnerId);
        return reviewRepository.findByDeliveryPartnerIdAndIsApprovedTrue(partnerId, pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    public Page<ReviewResponse> getUserReviews(String userEmail, Pageable pageable) {
        log.debug("Fetching reviews by user: {}", userEmail);
        User user = getUserByEmail(userEmail);
        return reviewRepository.findByUserId(user.getId(), pageable)
                .map(this::convertToResponse);
    }

    @Override
    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        log.debug("Fetching all reviews for admin");
        return reviewRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    @Transactional
    public void approveReview(Long reviewId) {
        log.info("Approving review: {}", reviewId);
        reviewRepository.approveReview(reviewId);
        
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        
        // Update restaurant or delivery partner rating
        if (review.getReviewType() == ReviewType.RESTAURANT && review.getRestaurant() != null) {
            updateRestaurantRating(review.getRestaurant().getId());
        } else if (review.getReviewType() == ReviewType.DELIVERY_PARTNER && review.getDeliveryPartner() != null) {
            updateDeliveryPartnerRating(review.getDeliveryPartner().getId());
        }
        
        log.info("Review approved successfully: {}", reviewId);
    }
    
    @Override
    @Transactional
    public void deleteReview(Long reviewId, String userEmail) {
        log.info("Deleting review: {}", reviewId);
        
        User user = getUserByEmail(userEmail);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        
        // Check authorization
        boolean isOwner = review.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        
        if (!isOwner && !isAdmin) {
            throw new BusinessException("You are not authorized to delete this review");
        }
        
        Long restaurantId = review.getRestaurant() != null ? review.getRestaurant().getId() : null;
        Long deliveryPartnerId = review.getDeliveryPartner() != null ? review.getDeliveryPartner().getId() : null;
        ReviewType reviewType = review.getReviewType();

        // Delete related replies and votes before removing the parent review.
        replyRepository.deleteByReviewId(reviewId);
        
        reviewRepository.delete(review);

        // Keep aggregate ratings accurate immediately after a delete.
        if (reviewType == ReviewType.RESTAURANT && restaurantId != null) {
            updateRestaurantRating(restaurantId);
        } else if (reviewType == ReviewType.DELIVERY_PARTNER && deliveryPartnerId != null) {
            updateDeliveryPartnerRating(deliveryPartnerId);
        }

        log.info("Review deleted successfully");
    }
    
    // ==================== Review Replies ====================
    
    @Override
    @Transactional
    public ReviewReplyResponse addReplyToReview(ReviewReplyRequest request, String userEmail) {
        log.info("Adding reply to review: {}", request.getReviewId());
        
        User user = getUserByEmail(userEmail);
        Review review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        
        // Check authorization (only restaurant owner or admin can reply)
        boolean isRestaurantOwner = review.getRestaurant() != null && 
            review.getRestaurant().getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        
        if (!isRestaurantOwner && !isAdmin) {
            throw new BusinessException("Only restaurant owner or admin can reply to reviews");
        }
        
        ReviewReply reply = new ReviewReply();
        reply.setReview(review);
        reply.setUser(user);
        reply.setReplyText(request.getReplyText());
        reply.setRepliedAt(LocalDateTime.now());
        reply.setIsEdited(false);
        
        ReviewReply savedReply = replyRepository.save(reply);
        log.info("Reply added successfully to review: {}", request.getReviewId());
        
        return convertToReplyResponse(savedReply);
    }
    
    @Override
    public List<ReviewReplyResponse> getRepliesForReview(Long reviewId) {
        log.debug("Fetching replies for review: {}", reviewId);
        return replyRepository.findByReviewIdOrderByRepliedAtDesc(reviewId)
                .stream()
                .map(this::convertToReplyResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void deleteReply(Long replyId, String userEmail) {
        log.info("Deleting reply: {}", replyId);
        
        User user = getUserByEmail(userEmail);
        ReviewReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Reply not found"));
        
        boolean isOwner = reply.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        
        if (!isOwner && !isAdmin) {
            throw new BusinessException("You are not authorized to delete this reply");
        }
        
        replyRepository.delete(reply);
        log.info("Reply deleted successfully");
    }
    
    // ==================== Helpful Votes ====================
    
    @Override
    @Transactional
    public void voteHelpful(HelpfulVoteRequest request, String userEmail) {
        log.info("Adding helpful vote for review: {}", request.getReviewId());
        
        User user = getUserByEmail(userEmail);
        Review review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        
        // Check if user already voted
        java.util.Optional<ReviewHelpful> existingVote = helpfulRepository
                .findByReviewIdAndUserId(review.getId(), user.getId());
        
        if (existingVote.isPresent()) {
            throw new BusinessException("You have already voted on this review");
        }
        
        ReviewHelpful vote = new ReviewHelpful();
        vote.setReview(review);
        vote.setUser(user);
        vote.setIsHelpful(request.getIsHelpful());
        helpfulRepository.save(vote);
        
        // Update review counts
        if (request.getIsHelpful()) {
            reviewRepository.incrementHelpfulCount(review.getId());
        } else {
            reviewRepository.incrementNotHelpfulCount(review.getId());
        }
        
        log.info("Helpful vote added successfully");
    }
    
    @Override
    @Transactional
    public void removeVote(Long reviewId, String userEmail) {
        log.info("Removing vote for review: {}", reviewId);
        
        User user = getUserByEmail(userEmail);
        ReviewHelpful vote = helpfulRepository.findByReviewIdAndUserId(reviewId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vote not found"));
        
        helpfulRepository.delete(vote);
        log.info("Vote removed successfully");
    }
    
    // ==================== Rating Summary ====================
    
    @Override
    public RatingSummaryResponse getRestaurantRatingSummary(Long restaurantId) {
        log.debug("Getting rating summary for restaurant: {}", restaurantId);
        
        Double averageRating = reviewRepository.getAverageRatingForRestaurant(restaurantId);
        Integer totalReviews = reviewRepository.getTotalReviewsForRestaurant(restaurantId);
        List<Object[]> distribution = reviewRepository.getRatingDistributionForRestaurant(restaurantId);
        
        Map<Integer, Integer> ratingMap = new HashMap<>();
        for (Object[] row : distribution) {
            Integer rating = ((Number) row[0]).intValue();
            Long count = (Long) row[1];
            ratingMap.put(rating, count.intValue());
        }
        
        return RatingSummaryResponse.builder()
                .averageRating(averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0)
                .totalReviews(totalReviews != null ? totalReviews : 0)
                .ratingDistribution(ratingMap)
                .fiveStarCount(ratingMap.getOrDefault(5, 0))
                .fourStarCount(ratingMap.getOrDefault(4, 0))
                .threeStarCount(ratingMap.getOrDefault(3, 0))
                .twoStarCount(ratingMap.getOrDefault(2, 0))
                .oneStarCount(ratingMap.getOrDefault(1, 0))
                .build();
    }
    
    @Override
    public RatingSummaryResponse getDeliveryPartnerRatingSummary(Long partnerId) {
        log.debug("Getting rating summary for delivery partner: {}", partnerId);
        
        Double averageRating = reviewRepository.getAverageRatingForDeliveryPartner(partnerId);
        Integer totalReviews = reviewRepository.getTotalReviewsForRestaurant(partnerId);
        
        return RatingSummaryResponse.builder()
                .averageRating(averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0)
                .totalReviews(totalReviews != null ? totalReviews : 0)
                .build();
    }
    
    // ==================== Helper Methods ====================
    
    @Override
    public boolean canUserReview(Long orderId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // User can only review their own delivered orders
        return order.getUser().getId().equals(user.getId()) && 
               order.getStatus() == OrderStatus.DELIVERED;
    }
    
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void createReviewNotification(Review review) {
        try {
            Long orderId = review.getOrder() != null ? review.getOrder().getId() : null;
            if (review.getRestaurant() != null && review.getRestaurant().getOwner() != null) {
                notificationService.createInAppNotification(
                        review.getRestaurant().getOwner().getId(),
                        "New restaurant review",
                        review.getUser().getFirstName() + " rated your restaurant " + review.getRating() + " stars.",
                        NotificationType.REVIEW_REQUEST,
                        orderId);
            }
            if (review.getDeliveryPartner() != null && review.getDeliveryPartner().getUser() != null) {
                notificationService.createInAppNotification(
                        review.getDeliveryPartner().getUser().getId(),
                        "New delivery review",
                        review.getUser().getFirstName() + " rated your delivery " + review.getRating() + " stars.",
                        NotificationType.REVIEW_REQUEST,
                        orderId);
            }
        } catch (Exception e) {
            log.warn("Review notification skipped: {}", e.getMessage());
        }
    }
    
    private void updateRestaurantRating(Long restaurantId) {
        Double avgRating = reviewRepository.getAverageRatingForRestaurant(restaurantId);
        Integer totalReviews = reviewRepository.getTotalReviewsForRestaurant(restaurantId);
        
        restaurantRepository.updateRestaurantRating(restaurantId, 
            avgRating != null ? avgRating : 0.0, 
            totalReviews != null ? totalReviews : 0);
    }
    
    private void updateDeliveryPartnerRating(Long partnerId) {
        Double avgRating = reviewRepository.getAverageRatingForDeliveryPartner(partnerId);
        // Update delivery partner rating
        // deliveryPartnerRepository.updateRating(partnerId, avgRating);
    }
    
    private ReviewResponse convertToResponse(Review review) {
        ReviewResponse response = modelMapper.map(review, ReviewResponse.class);
        
        response.setUserId(review.getUser().getId());
        response.setUserName(review.getUser().getFirstName() + " " + review.getUser().getLastName());
        response.setUserProfileImage(review.getUser().getProfileImageUrl());
        
        if (review.getRestaurant() != null) {
            response.setRestaurantId(review.getRestaurant().getId());
            response.setRestaurantName(review.getRestaurant().getName());
        }
        
        if (review.getDeliveryPartner() != null) {
            response.setDeliveryPartnerId(review.getDeliveryPartner().getId());
            response.setDeliveryPartnerName(
                review.getDeliveryPartner().getUser().getFirstName() + " " + 
                review.getDeliveryPartner().getUser().getLastName()
            );
        }
        
        if (review.getOrder() != null) {
            response.setOrderId(review.getOrder().getId());
            response.setOrderNumber(review.getOrder().getOrderNumber());
        }
        
        // Get replies
        List<ReviewReplyResponse> replies = replyRepository
                .findByReviewIdOrderByRepliedAtDesc(review.getId())
                .stream()
                .map(this::convertToReplyResponse)
                .collect(Collectors.toList());
        response.setReplies(replies);
        
        return response;
    }
    
    private ReviewReplyResponse convertToReplyResponse(ReviewReply reply) {
        ReviewReplyResponse response = modelMapper.map(reply, ReviewReplyResponse.class);
        response.setUserId(reply.getUser().getId());
        response.setUserName(reply.getUser().getFirstName() + " " + reply.getUser().getLastName());
        response.setUserRole(reply.getUser().getRole().toString());
        return response;
    }
}
