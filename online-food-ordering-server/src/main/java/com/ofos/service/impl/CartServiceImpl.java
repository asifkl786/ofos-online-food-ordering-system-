package com.ofos.service.impl;

import com.ofos.dto.request.AddToCartRequest;
import com.ofos.dto.request.UpdateCartItemRequest;
import com.ofos.dto.response.CartItemResponse;
import com.ofos.dto.response.CartResponse;
import com.ofos.entity.*;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.*;
import com.ofos.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {
    
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final ModelMapper modelMapper;
    
    private static final BigDecimal TAX_RATE = new BigDecimal("0.05"); // 5% GST
    
    @Override
    @Transactional
    public CartResponse addToCart(AddToCartRequest request, String userEmail) {
        log.info("Adding item to cart for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        MenuItem menuItem = getMenuItemById(request.getMenuItemId());
        
        // Check if menu item is available
        if (!menuItem.getIsAvailable()) {
            throw new BusinessException("Menu item is not available: " + menuItem.getName());
        }
        
        // Get or create cart
        Cart cart = getOrCreateCart(user);
        
        // Check if adding item from same restaurant
        Long restaurantId = menuItem.getRestaurant().getId();
        if (cart.getRestaurantId() != null && !cart.getRestaurantId().equals(restaurantId)) {
            throw new BusinessException("Cannot add items from different restaurants. " +
                    "Your cart already has items from " + cart.getRestaurantName() +
                    ". Please clear your cart first.");
        }
        
        // Check if item already exists in cart
        CartItem existingItem = cartItemRepository.findByCartIdAndMenuItemId(cart.getId(), menuItem.getId())
                .orElse(null);
        
        if (existingItem != null) {
            // Update quantity
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (newQuantity > menuItem.getMaxOrderQuantity()) {
                throw new BusinessException("Maximum order quantity for " + menuItem.getName() + 
                        " is " + menuItem.getMaxOrderQuantity());
            }
            existingItem.setQuantity(newQuantity);
            existingItem.setSubtotal(menuItem.getPrice().multiply(BigDecimal.valueOf(newQuantity)));
            cartItemRepository.save(existingItem);
            log.info("Updated existing cart item quantity to: {}", newQuantity);
        } else {
            // Add new item
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setMenuItem(menuItem);
            cartItem.setItemName(menuItem.getName());
            cartItem.setQuantity(request.getQuantity());
            cartItem.setUnitPrice(menuItem.getPrice());
            cartItem.setSubtotal(menuItem.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
            cartItem.setImageUrl(menuItem.getImageUrl());
            cartItem.setIsVegetarian(menuItem.getIsVegetarian());
            cartItem.setPreparationTime(menuItem.getPreparationTime());
            cart.getItems().add(cartItem);
            cartItemRepository.save(cartItem);
            log.info("Added new item to cart: {}", menuItem.getName());
        }
        
        // Update restaurant info in cart
        if (cart.getRestaurantId() == null) {
            Restaurant restaurant = menuItem.getRestaurant();
            cart.setRestaurantId(restaurant.getId());
            cart.setRestaurantName(restaurant.getName());
            cart.setDeliveryFee(restaurant.getDeliveryFee() != null ? restaurant.getDeliveryFee() : BigDecimal.ZERO);
            cartRepository.save(cart);
        }
        
        // Recalculate cart totals
        recalculateCart(cart);
        
        log.info("Item added to cart successfully");
        return convertToResponse(cart);
    }
    
    @Override
    @Transactional
    public CartResponse updateCartItem(UpdateCartItemRequest request, String userEmail) {
        log.info("Updating cart item: {} for user: {}", request.getCartItemId(), userEmail);
        
        User user = getUserByEmail(userEmail);
        Cart cart = getCartByUser(user);
        
        CartItem cartItem = cartItemRepository.findById(request.getCartItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        
        // Verify cart item belongs to user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BusinessException("Cart item does not belong to your cart");
        }
        
        MenuItem menuItem = cartItem.getMenuItem();
        
        // Check max order quantity
        if (request.getQuantity() > menuItem.getMaxOrderQuantity()) {
            throw new BusinessException("Maximum order quantity for " + menuItem.getName() + 
                    " is " + menuItem.getMaxOrderQuantity());
        }
        
        cartItem.setQuantity(request.getQuantity());
        cartItem.setSubtotal(menuItem.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
        cartItemRepository.save(cartItem);
        
        // Recalculate cart totals
        recalculateCart(cart);
        
        log.info("Cart item updated successfully");
        return convertToResponse(cart);
    }
    
    @Override
    @Transactional
    public CartResponse removeFromCart(Long cartItemId, String userEmail) {
        log.info("Removing item from cart: {} for user: {}", cartItemId, userEmail);
        
        User user = getUserByEmail(userEmail);
        Cart cart = getCartByUser(user);
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        
        // Verify cart item belongs to user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BusinessException("Cart item does not belong to your cart");
        }
        
        cartItemRepository.delete(cartItem);
        cart.getItems().remove(cartItem);
        
        // If cart becomes empty, clear restaurant info
        if (cart.getItems().isEmpty()) {
            cart.setRestaurantId(null);
            cart.setRestaurantName(null);
            cart.setDeliveryFee(BigDecimal.ZERO);
        }
        
        // Recalculate cart totals
        recalculateCart(cart);
        
        log.info("Cart item removed successfully");
        return convertToResponse(cart);
    }
    
    @Override
    @Transactional
    public CartResponse getCart(String userEmail) {
        log.debug("Fetching cart for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        Cart cart = cartRepository.findCartWithItemsByUserId(user.getId())
                .orElseGet(() -> createEmptyCart(user));

        recalculateCart(cart);
        
        return convertToResponse(cart);
    }
    
    @Override
    @Transactional
    public CartResponse clearCart(String userEmail) {
        log.info("Clearing cart for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        Cart cart = getCartByUser(user);
        
        cartItemRepository.deleteAllByCartId(cart.getId());
        cart.getItems().clear();
        cart.setRestaurantId(null);
        cart.setRestaurantName(null);
        cart.setDeliveryFee(BigDecimal.ZERO);
        
        recalculateCart(cart);
        
        log.info("Cart cleared successfully");
        return convertToResponse(cart);
    }
    
    @Override
    public Integer getCartItemCount(String userEmail) {
        User user = getUserByEmail(userEmail);
        return cartRepository.findCartWithItemsByUserId(user.getId())
                .map(cart -> cart.getItems().stream().mapToInt(CartItem::getQuantity).sum())
                .orElse(0);
    }
    
    @Override
    public void validateCart(String userEmail) {
        User user = getUserByEmail(userEmail);
        Cart cart = getCartByUser(user);
        
        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Cart is empty");
        }
        
        // Check if all items are still available
        for (CartItem item : cart.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(item.getMenuItem().getId())
                    .orElseThrow(() -> new BusinessException("Menu item not found: " + item.getItemName()));
            
            if (!menuItem.getIsAvailable()) {
                throw new BusinessException("Item is no longer available: " + item.getItemName());
            }
            
            if (item.getQuantity() > menuItem.getMaxOrderQuantity()) {
                throw new BusinessException("Maximum order quantity exceeded for: " + item.getItemName());
            }
        }
        
        // Check restaurant is still open
        Restaurant restaurant = restaurantRepository.findById(cart.getRestaurantId())
                .orElseThrow(() -> new BusinessException("Restaurant not found"));
        
        if (!restaurant.getIsOpen()) {
            throw new BusinessException("Restaurant is currently closed");
        }
    }
    
    @Override
    @Transactional
    public void mergeGuestCart(String userEmail, Long guestCartId) {
        log.info("Merging guest cart: {} with user: {}", guestCartId, userEmail);
        
        User user = getUserByEmail(userEmail);
        Cart guestCart = cartRepository.findById(guestCartId)
                .orElseThrow(() -> new ResourceNotFoundException("Guest cart not found"));
        
        Cart userCart = getOrCreateCart(user);
        
        // Merge guest cart items into user cart
        for (CartItem guestItem : guestCart.getItems()) {
            MenuItem menuItem = guestItem.getMenuItem();
            
            // Check if same restaurant
            if (userCart.getRestaurantId() != null && !userCart.getRestaurantId().equals(menuItem.getRestaurant().getId())) {
                throw new BusinessException("Cannot merge carts from different restaurants");
            }
            
            // Update restaurant info
            if (userCart.getRestaurantId() == null) {
                Restaurant restaurant = menuItem.getRestaurant();
                userCart.setRestaurantId(restaurant.getId());
                userCart.setRestaurantName(restaurant.getName());
                userCart.setDeliveryFee(restaurant.getDeliveryFee() != null ? restaurant.getDeliveryFee() : BigDecimal.ZERO);
            }
            
            // Check if item already exists
            CartItem existingItem = cartItemRepository.findByCartIdAndMenuItemId(userCart.getId(), menuItem.getId())
                    .orElse(null);
            
            if (existingItem != null) {
                existingItem.setQuantity(existingItem.getQuantity() + guestItem.getQuantity());
                existingItem.setSubtotal(menuItem.getPrice().multiply(BigDecimal.valueOf(existingItem.getQuantity())));
                cartItemRepository.save(existingItem);
            } else {
                guestItem.setCart(userCart);
                guestItem.setId(null);
                cartItemRepository.save(guestItem);
                userCart.getItems().add(guestItem);
            }
        }
        
        // Recalculate user cart
        recalculateCart(userCart);
        
        // Delete guest cart
        cartItemRepository.deleteAllByCartId(guestCartId);
        cartRepository.delete(guestCart);
        
        log.info("Guest cart merged successfully");
    }
    
    // Private Helper Methods
    
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    private MenuItem getMenuItemById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
    }
    
    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }
    
    private Cart getCartByUser(User user) {
        return cartRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException("Cart not found. Please add items to cart first."));
    }
    
    private Cart createEmptyCart(User user) {
        Cart emptyCart = new Cart();
        emptyCart.setUser(user);
        emptyCart.setTotalAmount(BigDecimal.ZERO);
        emptyCart.setTotalItems(0);
        emptyCart.setGrandTotal(BigDecimal.ZERO);
        return emptyCart;
    }
    
    private void recalculateCart(Cart cart) {
        // Calculate subtotal
        BigDecimal subtotal = cart.getItems().stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int totalItems = cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
        
        // Calculate tax
        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        
        BigDecimal deliveryFee = BigDecimal.ZERO;
        if (cart.getRestaurantId() != null && subtotal.compareTo(BigDecimal.ZERO) > 0) {
            Restaurant restaurant = restaurantRepository.findById(cart.getRestaurantId()).orElse(null);
            BigDecimal restaurantDeliveryFee = restaurant != null && restaurant.getDeliveryFee() != null
                    ? restaurant.getDeliveryFee()
                    : BigDecimal.ZERO;
            // Free delivery is a billing rule, so persist the effective fee used by checkout/order creation.
            deliveryFee = subtotal.compareTo(BigDecimal.valueOf(500)) >= 0 ? BigDecimal.ZERO : restaurantDeliveryFee;
        }
        
        // Calculate grand total
        BigDecimal grandTotal = subtotal.add(tax).add(deliveryFee);
        
        // Update cart
        cart.setTotalAmount(subtotal);
        cart.setTotalItems(totalItems);
        cart.setDeliveryFee(deliveryFee);
        cart.setTax(tax);
        cart.setGrandTotal(grandTotal);
        
        cartRepository.save(cart);
        log.debug("Cart recalculated - Subtotal: {}, Total Items: {}, Grand Total: {}", 
                subtotal, totalItems, grandTotal);
    }
    
    private CartResponse convertToResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setUserId(cart.getUser() != null ? cart.getUser().getId() : null);
        response.setUserName(cart.getUser() != null ? 
                cart.getUser().getFirstName() + " " + cart.getUser().getLastName() : null);
        response.setTotalItems(cart.getTotalItems());
        response.setTotalAmount(cart.getTotalAmount());
        response.setRestaurantId(cart.getRestaurantId());
        response.setRestaurantName(cart.getRestaurantName());
        response.setDeliveryFee(cart.getDeliveryFee());
        response.setTax(cart.getTax());
        response.setGrandTotal(cart.getGrandTotal());
        response.setIsEmpty(cart.getItems() == null || cart.getItems().isEmpty());
        
        if (cart.getItems() != null && !cart.getItems().isEmpty()) {
            response.setItems(cart.getItems().stream()
                    .map(this::convertCartItemToResponse)
                    .collect(Collectors.toList()));
        }
        
        return response;
    }
    
    private CartItemResponse convertCartItemToResponse(CartItem item) {
        CartItemResponse response = modelMapper.map(item, CartItemResponse.class);
        response.setMenuItemId(item.getMenuItem().getId());
        response.setIsAvailable(item.getMenuItem().getIsAvailable());
        // Always expose the current menu master veg flag so old cart snapshots do not show roti as non-veg.
        response.setIsVegetarian(item.getMenuItem().getIsVegetarian());
        return response;
    }
}
