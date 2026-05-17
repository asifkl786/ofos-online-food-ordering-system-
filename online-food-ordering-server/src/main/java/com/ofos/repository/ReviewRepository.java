package com.ofos.repository;

import com.ofos.entity.Review;
import com.ofos.entity.ReviewType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    Page<Review> findByRestaurantIdAndIsApprovedTrue(Long restaurantId, Pageable pageable);
    
    Page<Review> findByDeliveryPartnerIdAndIsApprovedTrue(Long deliveryPartnerId, Pageable pageable);
    
    List<Review> findByRestaurantIdAndIsApprovedTrue(Long restaurantId);
    
    List<Review> findByDeliveryPartnerIdAndIsApprovedTrue(Long deliveryPartnerId);
    
    Page<Review> findByUserId(Long userId, Pageable pageable);
    
    Optional<Review> findByOrderIdAndReviewType(Long orderId, ReviewType reviewType);
    
    boolean existsByOrderIdAndUserId(Long orderId, Long userId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restaurant.id = :restaurantId AND r.isApproved = true")
    Double getAverageRatingForRestaurant(@Param("restaurantId") Long restaurantId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.restaurant.id = :restaurantId AND r.isApproved = true")
    Integer getTotalReviewsForRestaurant(@Param("restaurantId") Long restaurantId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.deliveryPartner.id = :partnerId AND r.isApproved = true")
    Double getAverageRatingForDeliveryPartner(@Param("partnerId") Long partnerId);
    
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.restaurant.id = :restaurantId " +
           "AND r.isApproved = true GROUP BY r.rating")
    List<Object[]> getRatingDistributionForRestaurant(@Param("restaurantId") Long restaurantId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Review r SET r.isApproved = true, r.approvedAt = CURRENT_TIMESTAMP WHERE r.id = :reviewId")
    void approveReview(@Param("reviewId") Long reviewId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Review r SET r.helpfulCount = r.helpfulCount + 1 WHERE r.id = :reviewId")
    void incrementHelpfulCount(@Param("reviewId") Long reviewId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Review r SET r.notHelpfulCount = r.notHelpfulCount + 1 WHERE r.id = :reviewId")
    void incrementNotHelpfulCount(@Param("reviewId") Long reviewId);
}
