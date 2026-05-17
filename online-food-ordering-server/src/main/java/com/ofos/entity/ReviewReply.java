package com.ofos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "review_replies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReply extends BaseEntity {
    
    @Column(nullable = false, length = 1000)
    private String replyText;
    
    @ManyToOne
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Restaurant owner or Admin
    
    private LocalDateTime repliedAt;
    
    private Boolean isEdited = false;
}