package com.ofos.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewReplyResponse {
    private Long id;
    private String replyText;
    private Long userId;
    private String userName;
    private String userRole;
    private LocalDateTime repliedAt;
    private Boolean isEdited;
}