package com.ofos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "review_helpful")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewHelpful extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private Boolean isHelpful; // true = helpful, false = not helpful
}