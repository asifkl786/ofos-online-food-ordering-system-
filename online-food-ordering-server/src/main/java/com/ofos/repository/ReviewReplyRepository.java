package com.ofos.repository;

import com.ofos.entity.ReviewReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Long> {
    
    List<ReviewReply> findByReviewIdOrderByRepliedAtDesc(Long reviewId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM ReviewReply rr WHERE rr.review.id = :reviewId")
    void deleteByReviewId(@Param("reviewId") Long reviewId);
}