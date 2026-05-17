package com.ofos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewReplyRequest {
    
    @NotNull(message = "Review ID is required")
    private Long reviewId;
    
    @NotBlank(message = "Reply text is required")
    private String replyText;
}