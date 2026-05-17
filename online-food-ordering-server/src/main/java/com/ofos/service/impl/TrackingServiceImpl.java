package com.ofos.service.impl;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ofos.dto.request.LocationUpdateRequest;
import com.ofos.dto.request.TrackingStatusRequest;
import com.ofos.dto.response.DeliveryLocationResponse;
import com.ofos.dto.response.DeliveryPartnerResponse;
import com.ofos.dto.response.LiveTrackingResponse;
import com.ofos.dto.response.TrackingResponse;
import com.ofos.entity.Order;
import com.ofos.entity.OrderStatus;
import com.ofos.entity.OrderTracking;
import com.ofos.entity.User;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.OrderRepository;
import com.ofos.repository.OrderTrackingRepository;
import com.ofos.repository.UserRepository;
import com.ofos.service.TrackingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingServiceImpl implements TrackingService {
    
    private final OrderTrackingRepository trackingRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");
    
    @Override
    public TrackingResponse getOrderTracking(Long orderId) {
        log.debug("Fetching tracking for order: {}", orderId);
        
        OrderTracking tracking = trackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Tracking not found for order: " + orderId));
        
        Order order = tracking.getOrder();
        
        TrackingResponse response = new TrackingResponse();
        response.setOrderId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setCurrentStatus(tracking.getCurrentStatus().toString());
        response.setLastUpdateTime(tracking.getLastUpdateTime());
        response.setEstimatedRemainingMinutes(tracking.getEstimatedRemainingMinutes());
        
        // Convert status history to string map
        if (tracking.getStatusHistory() != null) {
            Map<String, LocalDateTime> history = tracking.getStatusHistory().entrySet().stream()
                    .collect(Collectors.toMap(
                        e -> e.getKey().toString(),
                        Map.Entry::getValue
                    ));
            response.setStatusHistory(history);
        }
        
        // Set current location
        if (tracking.getCurrentLatitude() != null) {
            DeliveryLocationResponse location = new DeliveryLocationResponse();
            location.setLatitude(tracking.getCurrentLatitude());
            location.setLongitude(tracking.getCurrentLongitude());
            location.setAddress(tracking.getCurrentLocationAddress());
            location.setLastUpdated(tracking.getLastUpdateTime());
            response.setCurrentLocation(location);
        }
        
        // Set delivery partner info
        if (order.getDeliveryPartner() != null) {
            DeliveryPartnerResponse partner = new DeliveryPartnerResponse();
            partner.setId(order.getDeliveryPartner().getId());
            partner.setName(order.getDeliveryPartner().getFirstName() + " " + order.getDeliveryPartner().getLastName());
            partner.setPhoneNumber(order.getDeliveryPartner().getPhoneNumber());
           // partner.setProfileImage(order.getDeliveryPartner().getProfileImageUrl());
            response.setDeliveryPartner(partner);
        }
        
        // Calculate ETA
        if (tracking.getEstimatedRemainingMinutes() != null) {
            LocalDateTime eta = LocalDateTime.now().plusMinutes(tracking.getEstimatedRemainingMinutes());
            response.setEstimatedDeliveryTime(eta.format(TIME_FORMATTER));
        }
        
        return response;
    }
    
    @Override
    public LiveTrackingResponse getLiveTracking(Long orderId, String userEmail) throws AccessDeniedException {
        log.debug("Fetching live tracking for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        OrderTracking tracking = trackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Tracking not found"));
        
        User user = userRepository.findByEmail(userEmail)
        	    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        	// Ownership guard
        	if (!order.getCustomer().getId().equals(user.getId())) {
        	    throw new AccessDeniedException("You do not own this order");
        	}
        
        return LiveTrackingResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(tracking.getCurrentStatus().toString())
                .deliveryPartnerLatitude(tracking.getCurrentLatitude())
                .deliveryPartnerLongitude(tracking.getCurrentLongitude())
                .deliveryPartnerName(tracking.getDeliveryPartnerName())
                .deliveryPartnerPhone(tracking.getDeliveryPartnerPhone())
                .estimatedMinutes(tracking.getEstimatedRemainingMinutes())
                .eta(calculateETA(tracking.getEstimatedRemainingMinutes()))
               // .lastUpdated(tracking.getLastUpdateTime().format(TIME_FORMATTER))
                .lastUpdated(
                		  tracking.getLastUpdateTime() != null
                		    ? tracking.getLastUpdateTime().format(TIME_FORMATTER)
                		    : null)
                .build();
    }
    
    @Override
    @Transactional
    public void updateDeliveryLocation(LocationUpdateRequest request, String partnerEmail) {
        log.info("Updating delivery location for order: {}", request.getOrderId());
        
        // Verify delivery partner
        User partner = userRepository.findByEmail(partnerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found"));
        
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Verify partner is assigned to this order
        if (order.getDeliveryPartner() == null || 
            !order.getDeliveryPartner().getId().equals(partner.getId())) {
            throw new BusinessException("You are not assigned to this order");
        }
        
        // Update location
        trackingRepository.updateDeliveryLocation(
            request.getOrderId(),
            request.getLatitude(),
            request.getLongitude(),
            request.getLocationAddress(),
            request.getEstimatedRemainingMinutes()
        );
        
        // Send real-time update via WebSocket
        sendLiveLocationUpdate(request.getOrderId(), request);
        
        log.info("Location updated successfully for order: {}", request.getOrderId());
    }
    
    @Override
    @Transactional
    public void updateOrderStatus(TrackingStatusRequest request, String userEmail) {
        log.info("Updating order status for order: {} to {}", request.getOrderId(), request.getStatus());
        
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        OrderTracking tracking = trackingRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Tracking not found"));
        
        OrderStatus oldStatus = tracking.getCurrentStatus();
        OrderStatus newStatus = request.getStatus();
        
        // Update tracking
        tracking.setCurrentStatus(newStatus);
        tracking.setLastUpdateTime(LocalDateTime.now());
        
        // Add to history - Convert enum to string
        if (tracking.getStatusHistory() == null) {
            tracking.setStatusHistory(new HashMap<>());
        }
        tracking.getStatusHistory().put(newStatus.toString(), LocalDateTime.now());
        
        trackingRepository.save(tracking);
        
        // Update order status
        order.setStatus(newStatus);
        orderRepository.save(order);
        
        // Send real-time status update via WebSocket
        sendStatusUpdate(request.getOrderId(), oldStatus, newStatus, request.getNotes());
        
        log.info("Order status updated from {} to {}", oldStatus, newStatus);
    }
    
    @Override
    @Transactional
    public void addStatusHistory(Long orderId, OrderStatus status, String notes) {
        OrderTracking tracking = trackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Tracking not found"));
        
        if (tracking.getStatusHistory() == null) {
            tracking.setStatusHistory(new HashMap<>());
        }
        tracking.getStatusHistory().put(status.toString(), LocalDateTime.now());
        tracking.setCurrentStatus(status);
        tracking.setLastUpdateTime(LocalDateTime.now());
        
        trackingRepository.save(tracking);
    }
    
    @Override
    public Integer getEstimatedDeliveryTime(Long orderId) {
        return trackingRepository.getEstimatedMinutes(orderId).orElse(null);
    }
    
    @Override
    public void sendRealTimeUpdate(Long orderId, String message) {
        // Send to customer's personal queue
        messagingTemplate.convertAndSendToUser(
            String.valueOf(orderId),
            "/queue/tracking",
            message
        );
    }
    
    // Private Helper Methods
    
    private void sendLiveLocationUpdate(Long orderId, LocationUpdateRequest location) {
        Map<String, Object> update = new HashMap<>();
        update.put("orderId", orderId);
        update.put("latitude", location.getLatitude());
        update.put("longitude", location.getLongitude());
        update.put("address", location.getLocationAddress());
        update.put("estimatedMinutes", location.getEstimatedRemainingMinutes());
        update.put("timestamp", LocalDateTime.now().toString());
        
        // Send to topic for real-time updates
        messagingTemplate.convertAndSend("/topic/orders/" + orderId + "/location", update);
    }
    
    private void sendStatusUpdate(Long orderId, OrderStatus oldStatus, OrderStatus newStatus, String notes) {
        Map<String, Object> update = new HashMap<>();
        update.put("orderId", orderId);
        update.put("oldStatus", oldStatus.toString());
        update.put("newStatus", newStatus.toString());
        update.put("notes", notes);
        update.put("timestamp", LocalDateTime.now().toString());
        
        // Send to customer's queue
        messagingTemplate.convertAndSendToUser(
            String.valueOf(orderId),
            "/queue/status",
            update
        );
        
        // Send to restaurant's queue
        messagingTemplate.convertAndSend("/topic/restaurants/status", update);
    }
    
    private String calculateETA(Integer minutes) {
        if (minutes == null) return "Calculating...";
        LocalDateTime eta = LocalDateTime.now().plusMinutes(minutes);
        return eta.format(TIME_FORMATTER);
    }
    // claude AI ne fix kiya h 
    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
    	    OrderStatus.PENDING, Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
    	    OrderStatus.CONFIRMED, Set.of(OrderStatus.PREPARING, OrderStatus.CANCELLED),
    	    OrderStatus.PREPARING, Set.of(OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED),
    	    OrderStatus.READY_FOR_PICKUP, Set.of(OrderStatus.OUT_FOR_DELIVERY),
    	    OrderStatus.OUT_FOR_DELIVERY, Set.of(OrderStatus.DELIVERED)
    	);

    	private void validateTransition(OrderStatus from, OrderStatus to) {
    	    if (!VALID_TRANSITIONS.getOrDefault(from, Set.of()).contains(to)) {
    	        throw new BusinessException(
    	          "Invalid transition from " + from + " to " + to);
    	    }
    	}
}