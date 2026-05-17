package com.ofos.service.impl;

import com.ofos.dto.request.DeliveryAssignmentRequest;
import com.ofos.dto.request.OrderRequest;
import com.ofos.dto.request.OrderStatusUpdateRequest;
import com.ofos.dto.response.*;
import com.ofos.entity.*;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.*;
import com.ofos.service.NotificationService;
import com.ofos.service.OrderService;
import com.ofos.utils.OrderNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderTrackingRepository orderTrackingRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;
    private final MenuItemRepository menuItemRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final OrderNumberGenerator orderNumberGenerator;
    private final ModelMapper modelMapper;
    private final NotificationService notificationService;
    
    private static final BigDecimal TAX_RATE = new BigDecimal("0.05");

    @Value("${platform.commission.rate:0.10}")
    private BigDecimal platformCommissionRate;
    
    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request, String userEmail) {
        log.info("Creating order for user: {}", userEmail);
        
        try {
            // 1. Get user
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
            log.debug("User found: {}", user.getId());
            
            // 2. Get user's cart
            Cart cart = cartRepository.findCartWithItemsByUserId(user.getId())
                    .orElseThrow(() -> new BusinessException("Cart is empty or not found"));
            
            // âœ… FIX: Check if cart has items
            if (cart.getItems() == null || cart.getItems().isEmpty()) {
                throw new BusinessException("Cannot create order with empty cart");
            }
            
            // 3. Get delivery address
            // âœ… FIX: Check if addressId is null
            if (request.getAddressId() == null) {
                throw new BusinessException("Address ID is required");
            }
            
            Address deliveryAddress = addressRepository.findByIdAndUser(request.getAddressId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + request.getAddressId()));
            log.debug("Delivery address found: {}", deliveryAddress.getId());
            
            // 4. Get restaurant
            // âœ… FIX: Check if cart has restaurantId
            if (cart.getRestaurantId() == null) {
                throw new BusinessException("Cart has no restaurant. Please add items to cart first.");
            }
            
            Restaurant restaurant = restaurantRepository.findById(cart.getRestaurantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + cart.getRestaurantId()));
            log.debug("Restaurant found: {}", restaurant.getId());
            
            // 5. Validate restaurant is open
            if (!restaurant.getIsOpen()) {
                throw new BusinessException("Restaurant is currently closed");
            }
            
            // 6. Validate cart items availability
            validateCartItems(cart);
            
            // 7. Calculate order amounts
            BigDecimal subtotal = cart.getTotalAmount() != null ? cart.getTotalAmount() : BigDecimal.ZERO;
            BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
            // Re-apply free delivery at order creation so checkout cannot persist a stale cart delivery fee.
            BigDecimal deliveryFee = subtotal.compareTo(BigDecimal.valueOf(500)) >= 0
                    ? BigDecimal.ZERO
                    : (cart.getDeliveryFee() != null ? cart.getDeliveryFee() : BigDecimal.ZERO);
            BigDecimal discount = calculateDiscount(request.getCouponCode(), subtotal);
            BigDecimal totalAmount = subtotal.add(tax).add(deliveryFee).subtract(discount);
            CommissionBreakdown commission = calculateCommission(subtotal, discount, totalAmount);
            
            // 8. Create order
            Order order = new Order();
            order.setOrderNumber(orderNumberGenerator.generateOrderNumber());
            order.setUser(user);
            order.setRestaurant(restaurant);
            order.setDeliveryAddress(deliveryAddress);
            order.setSubtotal(subtotal);
            order.setTax(tax);
            order.setDeliveryFee(deliveryFee);
            order.setDiscount(discount);
            order.setTotalAmount(totalAmount);
            order.setCommissionRate(commission.rate());
            order.setPlatformCommission(commission.platformCommission());
            order.setRestaurantPayout(commission.restaurantPayout());
            order.setStatus(OrderStatus.PENDING);
            order.setPaymentStatus(PaymentStatus.PENDING);
            // Keep the customer's selected method on the order itself so order tracking works even before payment capture.
            order.setPaymentMethod(request.getPaymentMethod());
            order.setSpecialInstructions(request.getSpecialInstructions());
            order.setEstimatedDeliveryTime(LocalDateTime.now().plusMinutes(45));
            
            Order savedOrder = orderRepository.save(order);
            log.info("Order saved with id: {}", savedOrder.getId());
            
            // 9. Create order items from cart items
            for (CartItem cartItem : cart.getItems()) {
                if (cartItem.getMenuItem() == null) {
                    log.warn("Cart item has no menu item, skipping: {}", cartItem.getId());
                    continue;
                }
                
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setMenuItem(cartItem.getMenuItem());
                orderItem.setItemName(cartItem.getItemName() != null ? cartItem.getItemName() : 
                                    cartItem.getMenuItem().getName());
                orderItem.setQuantity(cartItem.getQuantity() != null ? cartItem.getQuantity() : 1);
                orderItem.setUnitPrice(cartItem.getUnitPrice() != null ? cartItem.getUnitPrice() : 
                                      cartItem.getMenuItem().getPrice());
                orderItem.setSubtotal(cartItem.getSubtotal() != null ? cartItem.getSubtotal() : 
                                      orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
                orderItem.setImageUrl(cartItem.getImageUrl());
                // Menu master is the source of truth; cart snapshots may be stale for old items.
                orderItem.setIsVegetarian(cartItem.getMenuItem().getIsVegetarian());
                orderItem.setPreparationTime(cartItem.getPreparationTime());
                
                orderItemRepository.save(orderItem);
                log.debug("Order item saved for menu item: {}", cartItem.getMenuItem().getName());
            }
            
            // 10. Create order tracking
            OrderTracking tracking = new OrderTracking();
            tracking.setOrder(savedOrder);
            tracking.setCurrentStatus(OrderStatus.PENDING);
            tracking.setLastUpdateTime(LocalDateTime.now());
            tracking.setStatusHistory(new java.util.HashMap<>());
            tracking.getStatusHistory().put(OrderStatus.PENDING.toString(), LocalDateTime.now());
            orderTrackingRepository.save(tracking);
            
            // 11. Clear the cart
            try {
                cartRepository.clearCart(cart.getId());
                log.info("Cart cleared successfully");
            } catch (Exception e) {
                log.warn("Failed to clear cart: {}", e.getMessage());
            }
            
            log.info("Order created successfully with number: {}", savedOrder.getOrderNumber());
            // Store Phase 1 in-app notifications for customer and restaurant owner after the order is safely persisted.
            createOrderPlacedNotifications(savedOrder);
            
            return convertToResponse(savedOrder);
            
        } catch (BusinessException | ResourceNotFoundException e) {
            log.error("Business error while creating order: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating order: ", e);
            throw new BusinessException("Failed to create order: " + e.getMessage());
        }
    }
    
    private void validateCartItems(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return;
        }
        
        for (CartItem cartItem : cart.getItems()) {
            if (cartItem.getMenuItem() == null) {
                throw new BusinessException("Cart item has no menu item reference");
            }
            
            MenuItem menuItem = menuItemRepository.findById(cartItem.getMenuItem().getId())
                    .orElseThrow(() -> new BusinessException("Menu item not found: " + cartItem.getItemName()));
            
            if (!menuItem.getIsAvailable()) {
                throw new BusinessException("Item is no longer available: " + cartItem.getItemName());
            }
            
            Integer maxQuantity = menuItem.getMaxOrderQuantity() != null ? menuItem.getMaxOrderQuantity() : 10;
            if (cartItem.getQuantity() > maxQuantity) {
                throw new BusinessException("Maximum order quantity exceeded for: " + cartItem.getItemName() + 
                        ". Max allowed: " + maxQuantity);
            }
        }
    }
    
    private BigDecimal calculateDiscount(String couponCode, BigDecimal subtotal) {
        if (couponCode == null || couponCode.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        if (couponCode.equalsIgnoreCase("WELCOME10")) {
            return subtotal.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        }
        if (couponCode.equalsIgnoreCase("SAVE20")) {
            return subtotal.multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }

    private CommissionBreakdown calculateCommission(BigDecimal subtotal, BigDecimal discount, BigDecimal totalAmount) {
        BigDecimal safeSubtotal = subtotal != null ? subtotal : BigDecimal.ZERO;
        BigDecimal safeDiscount = discount != null ? discount : BigDecimal.ZERO;
        BigDecimal safeTotal = totalAmount != null ? totalAmount : BigDecimal.ZERO;
        BigDecimal rate = platformCommissionRate != null ? platformCommissionRate : new BigDecimal("0.10");

        // Commission is calculated on net food value only, so delivery/tax do not inflate platform earnings.
        BigDecimal commissionBase = safeSubtotal.subtract(safeDiscount).max(BigDecimal.ZERO);
        BigDecimal platformCommission = commissionBase.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal restaurantPayout = safeTotal.subtract(platformCommission).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        return new CommissionBreakdown(rate, platformCommission, restaurantPayout);
    }
    
    // Other required methods...
    
    @Override
    public OrderResponse getOrderById(Long orderId) {
        if (orderId == null) {
            throw new BusinessException("Order ID cannot be null");
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return convertToResponse(order);
    }
    
    @Override
    public OrderResponse getOrderByNumber(String orderNumber) {
        if (orderNumber == null || orderNumber.isEmpty()) {
            throw new BusinessException("Order number cannot be null or empty");
        }
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        return convertToResponse(order);
    }
    
    @Override
    public Page<OrderResponse> getUserOrders(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    public Page<OrderResponse> getRestaurantOrders(Long restaurantId, Pageable pageable, String userEmail) {
        if (restaurantId == null) {
            throw new BusinessException("Restaurant ID cannot be null");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + restaurantId));

        // Restaurant owners can view only their own restaurant orders; admins can inspect any restaurant.
        boolean isRestaurantOwner = restaurant.getOwner() != null && restaurant.getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        if (!isRestaurantOwner && !isAdmin) {
            throw new BusinessException("You are not authorized to view orders for this restaurant");
        }

        return orderRepository.findByRestaurantId(restaurantId, pageable)
                .map(this::convertToResponse);
    }

    @Override
    public Page<OrderResponse> getOwnerOrders(String userEmail, Pageable pageable) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new BusinessException("Owner email cannot be empty");
        }

        // This powers the restaurant-owner order board with one list across all owned restaurants.
        return orderRepository.findByRestaurantOwnerEmail(userEmail, pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request, String userEmail) {
        if (orderId == null) {
            throw new BusinessException("Order ID cannot be null");
        }
        if (request == null || request.getStatus() == null) {
            throw new BusinessException("Status is required");
        }
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        boolean isRestaurantOwner = order.getRestaurant().getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        
        if (!isRestaurantOwner && !isAdmin) {
            throw new BusinessException("You are not authorized to update this order status");
        }
        
        validateStatusTransition(order.getStatus(), request.getStatus());
        
        order.setStatus(request.getStatus());
        
        if (request.getStatus() == OrderStatus.CANCELLED && request.getCancellationReason() != null) {
            order.setCancellationReason(request.getCancellationReason());
            order.setCancelledAt(LocalDateTime.now());
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }
        
        if (request.getStatus() == OrderStatus.DELIVERED) {
            order.setDeliveryTime(LocalDateTime.now());
            order.setPaymentStatus(PaymentStatus.SUCCESS);
        }
        
        Order updatedOrder = orderRepository.save(order);
        
        OrderTracking tracking = orderTrackingRepository.findByOrderId(orderId)
                .orElse(new OrderTracking());
        tracking.setOrder(updatedOrder);
        tracking.setCurrentStatus(request.getStatus());
        tracking.setLastUpdateTime(LocalDateTime.now());
        if (tracking.getStatusHistory() == null) {
            tracking.setStatusHistory(new java.util.HashMap<>());
        }
        tracking.getStatusHistory().put(request.getStatus().toString(), LocalDateTime.now());
        orderTrackingRepository.save(tracking);
        
        createOrderStatusNotification(updatedOrder, request.getStatus(), request.getCancellationReason());
        return convertToResponse(updatedOrder);
    }
    
    @Override
    @Transactional
    public OrderResponse assignDeliveryPartner(Long orderId, DeliveryAssignmentRequest request) {
        if (orderId == null) {
            throw new BusinessException("Order ID cannot be null");
        }
        if (request == null || request.getDeliveryPartnerId() == null) {
            throw new BusinessException("Delivery partner ID is required");
        }
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        User deliveryPartner = userRepository.findById(request.getDeliveryPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found"));
        
        if (deliveryPartner.getRole() != UserRole.DELIVERY_PARTNER && deliveryPartner.getRole() != UserRole.ADMIN) {
            throw new BusinessException("Selected user is not a delivery partner");
        }
        
        order.setDeliveryPartner(deliveryPartner);
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        
        Order updatedOrder = orderRepository.save(order);
        
        OrderTracking tracking = orderTrackingRepository.findByOrderId(orderId)
                .orElse(new OrderTracking());
        tracking.setDeliveryPartnerPhone(deliveryPartner.getPhoneNumber());
        orderTrackingRepository.save(tracking);
        
        return convertToResponse(updatedOrder);
    }
    
    @Override
    @Transactional
    public OrderResponse cancelOrder(Long orderId, String cancellationReason, String userEmail) {
        if (orderId == null) {
            throw new BusinessException("Order ID cannot be null");
        }
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        boolean isCustomer = order.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        
        if (!isCustomer && !isAdmin) {
            throw new BusinessException("You are not authorized to cancel this order");
        }
        
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BusinessException("Order cannot be cancelled in current status: " + order.getStatus());
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus(PaymentStatus.REFUNDED);
        order.setCancellationReason(cancellationReason);
        order.setCancelledAt(LocalDateTime.now());
        
        Order cancelledOrder = orderRepository.save(order);
        
        OrderTracking tracking = orderTrackingRepository.findByOrderId(orderId)
                .orElse(new OrderTracking());
        tracking.setCurrentStatus(OrderStatus.CANCELLED);
        tracking.setLastUpdateTime(LocalDateTime.now());
        if (tracking.getStatusHistory() == null) {
            tracking.setStatusHistory(new java.util.HashMap<>());
        }
        tracking.getStatusHistory().put(OrderStatus.CANCELLED.toString(), LocalDateTime.now());
        orderTrackingRepository.save(tracking);
        
        createOrderStatusNotification(cancelledOrder, OrderStatus.CANCELLED, cancellationReason);
        return convertToResponse(cancelledOrder);
    }
    
    @Override
    public Page<OrderSummaryResponse> getOrderHistory(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return orderRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::convertToSummaryResponse);
    }
    
    @Override
    public Long getActiveOrdersCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<OrderStatus> activeStatuses = List.of(
            OrderStatus.PENDING, OrderStatus.CONFIRMED, 
            OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP, 
            OrderStatus.OUT_FOR_DELIVERY
        );
        
        return (long) orderRepository.findActiveOrdersByUser(user.getId(), activeStatuses).size();
    }
    
    @Override
    public void processOrderPayment(Long orderId, String paymentDetails) {
        log.info("Processing payment for order: {}", orderId);
        orderRepository.updatePaymentStatus(orderId, PaymentStatus.SUCCESS);
        orderRepository.findById(orderId).ifPresent(order ->
            safeNotify(order.getUser().getId(), "Payment successful",
                    "Payment received for order #" + order.getOrderNumber() + ".",
                    NotificationType.PAYMENT_SUCCESS, order.getId())
        );
    }

    private void createOrderPlacedNotifications(Order order) {
        safeNotify(order.getUser().getId(), "Order placed",
                "Your order #" + order.getOrderNumber() + " has been placed successfully.",
                NotificationType.ORDER_CONFIRMATION, order.getId());
        if (order.getRestaurant() != null && order.getRestaurant().getOwner() != null) {
            safeNotify(order.getRestaurant().getOwner().getId(), "New order received",
                    "New order #" + order.getOrderNumber() + " is waiting for your action.",
                    NotificationType.ORDER_CONFIRMATION, order.getId());
        }
    }

    private void createOrderStatusNotification(Order order, OrderStatus status, String reason) {
        String message = status == OrderStatus.CANCELLED
                ? "Order #" + order.getOrderNumber() + " was cancelled. Reason: " + (reason != null ? reason : "Not provided")
                : "Order #" + order.getOrderNumber() + " status is now " + status + ".";
        NotificationType type = status == OrderStatus.DELIVERED
                ? NotificationType.ORDER_DELIVERED
                : status == OrderStatus.CANCELLED ? NotificationType.ORDER_CANCELLED : NotificationType.ORDER_STATUS_UPDATE;
        safeNotify(order.getUser().getId(), "Order update", message, type, order.getId());
    }

    private void safeNotify(Long userId, String title, String message, NotificationType type, Long orderId) {
        try {
            notificationService.createInAppNotification(userId, title, message, type, orderId);
        } catch (Exception e) {
            log.warn("Notification skipped: {}", e.getMessage());
        }
    }
    
    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        switch (current) {
            case PENDING:
                if (next != OrderStatus.CONFIRMED && next != OrderStatus.CANCELLED) {
                    throw new BusinessException("Invalid status transition from PENDING to " + next);
                }
                break;
            case CONFIRMED:
                if (next != OrderStatus.PREPARING && next != OrderStatus.CANCELLED) {
                    throw new BusinessException("Invalid status transition from CONFIRMED to " + next);
                }
                break;
            case PREPARING:
                if (next != OrderStatus.READY_FOR_PICKUP) {
                    throw new BusinessException("Invalid status transition from PREPARING to " + next);
                }
                break;
            case READY_FOR_PICKUP:
                if (next != OrderStatus.OUT_FOR_DELIVERY) {
                    throw new BusinessException("Invalid status transition from READY_FOR_PICKUP to " + next);
                }
                break;
            case OUT_FOR_DELIVERY:
                if (next != OrderStatus.DELIVERED) {
                    throw new BusinessException("Invalid status transition from OUT_FOR_DELIVERY to " + next);
                }
                break;
            case DELIVERED:
            case CANCELLED:
            case REFUNDED:
                throw new BusinessException("Cannot transition from final status: " + current);
            default:
                break;
        }
    }
    
    private OrderResponse convertToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setStatus(order.getStatus().toString());
        response.setPaymentStatus(order.getPaymentStatus().toString());
        // Expose the captured payment method first, then fall back to the method selected during checkout.
        if (order.getPayment() != null && order.getPayment().getPaymentMethod() != null) {
            response.setPaymentMethod(order.getPayment().getPaymentMethod().toString());
        } else if (order.getPaymentMethod() != null) {
            response.setPaymentMethod(order.getPaymentMethod().toString());
        }
        response.setSubtotal(order.getSubtotal());
        response.setTax(order.getTax());
        response.setDeliveryFee(order.getDeliveryFee());
        response.setDiscount(order.getDiscount());
        response.setTotalAmount(order.getTotalAmount());
        CommissionBreakdown commission = resolveCommission(order);
        response.setCommissionRate(commission.rate());
        response.setPlatformCommission(commission.platformCommission());
        response.setRestaurantPayout(commission.restaurantPayout());
        response.setCreatedAt(order.getCreatedAt());
        response.setEstimatedDeliveryTime(order.getEstimatedDeliveryTime());
        response.setSpecialInstructions(order.getSpecialInstructions());
        response.setCancellationReason(order.getCancellationReason());
        
        // Set user info
        if (order.getUser() != null) {
            UserInfoResponse userInfo = new UserInfoResponse();
            userInfo.setId(order.getUser().getId());
            userInfo.setEmail(order.getUser().getEmail());
            userInfo.setFirstName(order.getUser().getFirstName());
            userInfo.setLastName(order.getUser().getLastName());
            userInfo.setPhoneNumber(order.getUser().getPhoneNumber());
            response.setUser(userInfo);
        }
        
        // Set restaurant info
        if (order.getRestaurant() != null) {
            RestaurantInfoResponse restaurantInfo = new RestaurantInfoResponse();
            restaurantInfo.setId(order.getRestaurant().getId());
            restaurantInfo.setName(order.getRestaurant().getName());
            restaurantInfo.setCuisineType(order.getRestaurant().getCuisineType());
            restaurantInfo.setContactPhone(order.getRestaurant().getContactPhone());
            restaurantInfo.setContactEmail(order.getRestaurant().getContactEmail());
            restaurantInfo.setGstNumber(order.getRestaurant().getGstNumber());
            restaurantInfo.setFssaiLicenseNumber(order.getRestaurant().getFssaiLicenseNumber());
            // Invoice PDFs need a single printable restaurant address, so prefer the primary address when present.
            if (order.getRestaurant().getAddresses() != null && !order.getRestaurant().getAddresses().isEmpty()) {
                RestaurantAddress restaurantAddress = order.getRestaurant().getAddresses().stream()
                        .filter(address -> Boolean.TRUE.equals(address.getIsPrimary()))
                        .findFirst()
                        .orElse(order.getRestaurant().getAddresses().get(0));
                restaurantInfo.setAddress(formatRestaurantAddress(restaurantAddress));
            }
            response.setRestaurant(restaurantInfo);
        }
        
        // Set address
        if (order.getDeliveryAddress() != null) {
            AddressResponse addressResponse = new AddressResponse();
            addressResponse.setId(order.getDeliveryAddress().getId());
            addressResponse.setStreetAddress(order.getDeliveryAddress().getStreetAddress());
            addressResponse.setApartmentNumber(order.getDeliveryAddress().getApartmentNumber());
            addressResponse.setCity(order.getDeliveryAddress().getCity());
            addressResponse.setState(order.getDeliveryAddress().getState());
            addressResponse.setZipCode(order.getDeliveryAddress().getZipCode());
            addressResponse.setCountry(order.getDeliveryAddress().getCountry());
            addressResponse.setLandmark(order.getDeliveryAddress().getLandmark());
            addressResponse.setPhoneNumber(order.getDeliveryAddress().getPhoneNumber());
            addressResponse.setReceiverName(order.getDeliveryAddress().getReceiverName());
            response.setDeliveryAddress(addressResponse);
        }

        deliveryAssignmentRepository.findByOrderId(order.getId()).ifPresent(assignment -> {
            DeliveryInfoResponse deliveryInfo = new DeliveryInfoResponse();
            DeliveryPartner partner = assignment.getDeliveryPartner();
            // Expose the real assigned rider so customer tracking does not fall back to mock delivery data.
            deliveryInfo.setDeliveryPartnerId(partner.getId());
            deliveryInfo.setDeliveryPartnerName(partner.getUser().getFirstName() + " " + partner.getUser().getLastName());
            deliveryInfo.setDeliveryPartnerPhone(partner.getUser().getPhoneNumber());
            deliveryInfo.setCurrentLatitude(partner.getCurrentLatitude());
            deliveryInfo.setCurrentLongitude(partner.getCurrentLongitude());
            deliveryInfo.setDeliveryStatus(assignment.getAssignmentStatus().toString());
            deliveryInfo.setEstimatedDeliveryTime(
                    assignment.getEstimatedTimeInMinutes() != null
                            ? assignment.getEstimatedTimeInMinutes() + " min"
                            : null
            );
            deliveryInfo.setLastUpdateTime(assignment.getUpdatedAt() != null ? assignment.getUpdatedAt().toString() : null);
            response.setDeliveryInfo(deliveryInfo);
        });
        
        // Set order items
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            response.setItems(order.getOrderItems().stream()
                    .map(item -> {
                        OrderItemResponse itemResponse = new OrderItemResponse();
                        itemResponse.setId(item.getId());
                        itemResponse.setMenuItemId(item.getMenuItem() != null ? item.getMenuItem().getId() : null);
                        itemResponse.setItemName(item.getItemName());
                        itemResponse.setQuantity(item.getQuantity());
                        itemResponse.setUnitPrice(item.getUnitPrice());
                        itemResponse.setSubtotal(item.getSubtotal());
                        itemResponse.setIsVegetarian(item.getIsVegetarian());
                        return itemResponse;
                    })
                    .collect(Collectors.toList()));
        }
        
        return response;
    }

    private String formatRestaurantAddress(RestaurantAddress address) {
        return List.of(address.getStreetAddress(), address.getLandmark(), address.getCity(), address.getState(), address.getZipCode(), address.getCountry())
                .stream()
                .filter(part -> part != null && !part.isBlank())
                .collect(Collectors.joining(", "));
    }

    private CommissionBreakdown resolveCommission(Order order) {
        if (order.getPlatformCommission() != null && order.getRestaurantPayout() != null) {
            BigDecimal rate = order.getCommissionRate() != null ? order.getCommissionRate() : platformCommissionRate;
            return new CommissionBreakdown(rate, order.getPlatformCommission(), order.getRestaurantPayout());
        }
        return calculateCommission(order.getSubtotal(), order.getDiscount(), order.getTotalAmount());
    }

    private record CommissionBreakdown(BigDecimal rate, BigDecimal platformCommission, BigDecimal restaurantPayout) {}
    
    private OrderSummaryResponse convertToSummaryResponse(Order order) {
        OrderSummaryResponse response = new OrderSummaryResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setStatus(order.getStatus().toString());
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedAt(order.getCreatedAt());
        response.setRestaurantName(order.getRestaurant().getName());
        response.setItemCount(order.getOrderItems().stream().mapToInt(OrderItem::getQuantity).sum());
        return response;
    }
}

