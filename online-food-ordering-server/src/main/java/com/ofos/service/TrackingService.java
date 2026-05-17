package com.ofos.service;

import java.nio.file.AccessDeniedException;

import com.ofos.dto.request.LocationUpdateRequest;
import com.ofos.dto.request.TrackingStatusRequest;
import com.ofos.dto.response.LiveTrackingResponse;
import com.ofos.dto.response.TrackingResponse;
import com.ofos.entity.OrderStatus;

public interface TrackingService {
    
    TrackingResponse getOrderTracking(Long orderId);
    
    LiveTrackingResponse getLiveTracking(Long orderId, String userEmail) throws AccessDeniedException;
    
    void updateDeliveryLocation(LocationUpdateRequest request, String partnerEmail);
    
    void updateOrderStatus(TrackingStatusRequest request, String userEmail);
    
    void addStatusHistory(Long orderId, OrderStatus status, String notes);
    
    Integer getEstimatedDeliveryTime(Long orderId);
    
    void sendRealTimeUpdate(Long orderId, String message);
}
