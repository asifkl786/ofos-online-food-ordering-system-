package com.ofos.controller;

import com.ofos.dto.request.HelpfulVoteRequest;
import com.ofos.dto.request.ReviewReplyRequest;
import com.ofos.dto.request.ReviewRequest;
import com.ofos.dto.request.ReviewUpdateRequest;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.RatingSummaryResponse;
import com.ofos.dto.response.ReviewReplyResponse;
import com.ofos.dto.response.ReviewResponse;
import com.ofos.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Review & Rating", description = "APIs for managing reviews and ratings")
public class ReviewController {
    
    private final ReviewService reviewService;
    
    // ==================== Review APIs ====================
    
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Add a review")
    public ResponseEntity<ApiResponse> addReview(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to add review");
        ReviewResponse response = reviewService.addReview(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review added successfully", response));
    }
    
    @GetMapping("/{reviewId}")
    @Operation(summary = "Get review by ID")
    public ResponseEntity<ApiResponse> getReviewById(@PathVariable Long reviewId) {
        log.info("REST request to get review: {}", reviewId);
        ReviewResponse response = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review found", response));
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Update review")
    public ResponseEntity<ApiResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to update review: {}", reviewId);
        ReviewResponse response = reviewService.updateReview(reviewId, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", response));
    }
    
    @GetMapping("/restaurant/{restaurantId}")
    @Operation(summary = "Get reviews for a restaurant")
    public ResponseEntity<ApiResponse> getRestaurantReviews(
            @PathVariable Long restaurantId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get reviews for restaurant: {}", restaurantId);
        Page<ReviewResponse> reviews = reviewService.getRestaurantReviews(restaurantId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Reviews found", reviews));
    }
    
    @GetMapping("/delivery-partner/{partnerId}")
    @Operation(summary = "Get reviews for a delivery partner")
    public ResponseEntity<ApiResponse> getDeliveryPartnerReviews(
            @PathVariable Long partnerId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get reviews for delivery partner: {}", partnerId);
        Page<ReviewResponse> reviews = reviewService.getDeliveryPartnerReviews(partnerId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Reviews found", reviews));
    }
    
    @GetMapping("/my-reviews")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get current user's reviews")
    public ResponseEntity<ApiResponse> getMyReviews(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get my reviews");
        Page<ReviewResponse> reviews = reviewService.getUserReviews(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Reviews found", reviews));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all reviews (Admin only)")
    public ResponseEntity<ApiResponse> getAllReviews(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get all reviews for admin");
        Page<ReviewResponse> reviews = reviewService.getAllReviews(pageable);
        return ResponseEntity.ok(ApiResponse.success("Reviews found", reviews));
    }
    
    @PatchMapping("/{reviewId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve review (Admin only)")
    public ResponseEntity<ApiResponse> approveReview(@PathVariable Long reviewId) {
        log.info("REST request to approve review: {}", reviewId);
        reviewService.approveReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review approved successfully", null));
    }
    
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Delete review")
    public ResponseEntity<ApiResponse> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to delete review: {}", reviewId);
        reviewService.deleteReview(reviewId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }
    
    // ==================== Reply APIs ====================
    
    @PostMapping("/reply")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Reply to a review")
    public ResponseEntity<ApiResponse> addReplyToReview(
            @Valid @RequestBody ReviewReplyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to add reply to review: {}", request.getReviewId());
        ReviewReplyResponse response = reviewService.addReplyToReview(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reply added successfully", response));
    }
    
    @GetMapping("/{reviewId}/replies")
    @Operation(summary = "Get all replies for a review")
    public ResponseEntity<ApiResponse> getRepliesForReview(@PathVariable Long reviewId) {
        log.info("REST request to get replies for review: {}", reviewId);
        List<ReviewReplyResponse> replies = reviewService.getRepliesForReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Replies found", replies));
    }
    
    @DeleteMapping("/reply/{replyId}")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'ADMIN')")
    @Operation(summary = "Delete a reply")
    public ResponseEntity<ApiResponse> deleteReply(
            @PathVariable Long replyId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to delete reply: {}", replyId);
        reviewService.deleteReply(replyId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Reply deleted successfully", null));
    }
    
    // ==================== Helpful Vote APIs ====================
    
    @PostMapping("/vote")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Vote helpful/not helpful on a review")
    public ResponseEntity<ApiResponse> voteHelpful(
            @Valid @RequestBody HelpfulVoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to vote on review: {}", request.getReviewId());
        reviewService.voteHelpful(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Vote recorded successfully", null));
    }
    
    @DeleteMapping("/{reviewId}/vote")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Remove vote from review")
    public ResponseEntity<ApiResponse> removeVote(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to remove vote from review: {}", reviewId);
        reviewService.removeVote(reviewId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Vote removed successfully", null));
    }
    
    // ==================== Rating Summary APIs ====================
    
    @GetMapping("/restaurant/{restaurantId}/rating-summary")
    @Operation(summary = "Get rating summary for a restaurant")
    public ResponseEntity<ApiResponse> getRestaurantRatingSummary(@PathVariable Long restaurantId) {
        log.info("REST request to get rating summary for restaurant: {}", restaurantId);
        RatingSummaryResponse response = reviewService.getRestaurantRatingSummary(restaurantId);
        return ResponseEntity.ok(ApiResponse.success("Rating summary found", response));
    }
    
    @GetMapping("/delivery-partner/{partnerId}/rating-summary")
    @Operation(summary = "Get rating summary for a delivery partner")
    public ResponseEntity<ApiResponse> getDeliveryPartnerRatingSummary(@PathVariable Long partnerId) {
        log.info("REST request to get rating summary for delivery partner: {}", partnerId);
        RatingSummaryResponse response = reviewService.getDeliveryPartnerRatingSummary(partnerId);
        return ResponseEntity.ok(ApiResponse.success("Rating summary found", response));
    }
    
    @GetMapping("/can-review/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Check if user can review an order")
    public ResponseEntity<ApiResponse> canUserReview(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("REST request to check if user can review order: {}", orderId);
        boolean canReview = reviewService.canUserReview(orderId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Can review: " + canReview, canReview));
    }
}
