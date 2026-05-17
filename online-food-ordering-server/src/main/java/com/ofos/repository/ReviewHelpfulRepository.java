package com.ofos.repository;

import com.ofos.entity.ReviewHelpful;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewHelpfulRepository extends JpaRepository<ReviewHelpful, Long> {
    
    Optional<ReviewHelpful> findByReviewIdAndUserId(Long reviewId, Long userId);
    
    @Query("SELECT COUNT(rh) FROM ReviewHelpful rh WHERE rh.review.id = :reviewId AND rh.isHelpful = true")
    Integer countHelpfulVotes(@Param("reviewId") Long reviewId);
    
    @Query("SELECT COUNT(rh) FROM ReviewHelpful rh WHERE rh.review.id = :reviewId AND rh.isHelpful = false")
    Integer countNotHelpfulVotes(@Param("reviewId") Long reviewId);
}