package com.ofos.dto.request;

import java.util.List;

import com.ofos.entity.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderRequest {
    
	    @NotNull(message = "Restaurant ID is required")
	    private Long restaurantId;
	    
	    @NotNull(message = "Address ID is required")
	    private Long addressId;
	    
	    private String specialInstructions;
	    
	    @NotNull(message = "Payment method is required")
	    private PaymentMethod paymentMethod;
	    
	    @NotNull(message = "Order items are required")
	    private List<OrderItemRequest> items;
	    
	    private String couponCode;
}

