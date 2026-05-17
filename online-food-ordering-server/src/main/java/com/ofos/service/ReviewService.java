package com.ofos.service;

import com.ofos.dto.request.HelpfulVoteRequest;
import com.ofos.dto.request.ReviewReplyRequest;
import com.ofos.dto.request.ReviewRequest;
import com.ofos.dto.request.ReviewUpdateRequest;
import com.ofos.dto.response.RatingSummaryResponse;
import com.ofos.dto.response.ReviewReplyResponse;
import com.ofos.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {
    
    // Review CRUD
    ReviewResponse addReview(ReviewRequest request, String userEmail);
    
    ReviewResponse getReviewById(Long reviewId);

    ReviewResponse updateReview(Long reviewId, ReviewUpdateRequest request, String userEmail);
    
    Page<ReviewResponse> getRestaurantReviews(Long restaurantId, Pageable pageable);
    
    Page<ReviewResponse> getDeliveryPartnerReviews(Long partnerId, Pageable pageable);
    
    Page<ReviewResponse> getUserReviews(String userEmail, Pageable pageable);

    Page<ReviewResponse> getAllReviews(Pageable pageable);
    
    void approveReview(Long reviewId);
    
    void deleteReview(Long reviewId, String userEmail);
    
    // Review Replies
    ReviewReplyResponse addReplyToReview(ReviewReplyRequest request, String userEmail);
    
    List<ReviewReplyResponse> getRepliesForReview(Long reviewId);
    
    void deleteReply(Long replyId, String userEmail);
    
    // Helpful Votes
    void voteHelpful(HelpfulVoteRequest request, String userEmail);
    
    void removeVote(Long reviewId, String userEmail);
    
    // Rating Summary
    RatingSummaryResponse getRestaurantRatingSummary(Long restaurantId);
    
    RatingSummaryResponse getDeliveryPartnerRatingSummary(Long partnerId);
    
    // Check if user can review
    boolean canUserReview(Long orderId, String userEmail);
}
