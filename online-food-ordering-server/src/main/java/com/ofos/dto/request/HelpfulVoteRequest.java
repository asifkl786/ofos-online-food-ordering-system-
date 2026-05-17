package com.ofos.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HelpfulVoteRequest {
    
    @NotNull(message = "Review ID is required")
    private Long reviewId;
    
    @NotNull(message = "Vote is required")
    private Boolean isHelpful;
}