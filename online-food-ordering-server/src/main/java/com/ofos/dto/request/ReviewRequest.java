package com.ofos.dto.request;

import com.ofos.entity.ReviewType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
	
	 // ✅ ADD THIS FIELD - Missing field
    private Long orderId;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;
    
    private String comment;
    
    @NotNull(message = "Review type is required")
    private ReviewType reviewType;
    
    private Long restaurantId;
    
    private Long deliveryPartnerId;
    
    private String reviewImages;
}