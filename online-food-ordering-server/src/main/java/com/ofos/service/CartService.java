package com.ofos.service;

import com.ofos.dto.request.AddToCartRequest;
import com.ofos.dto.request.UpdateCartItemRequest;
import com.ofos.dto.response.CartResponse;

public interface CartService {
    
    CartResponse addToCart(AddToCartRequest request, String userEmail);
    
    CartResponse updateCartItem(UpdateCartItemRequest request, String userEmail);
    
    CartResponse removeFromCart(Long cartItemId, String userEmail);
    
    CartResponse getCart(String userEmail);
    
    CartResponse clearCart(String userEmail);
    
    Integer getCartItemCount(String userEmail);
    
    void validateCart(String userEmail);
    
    void mergeGuestCart(String userEmail, Long guestCartId);
}
