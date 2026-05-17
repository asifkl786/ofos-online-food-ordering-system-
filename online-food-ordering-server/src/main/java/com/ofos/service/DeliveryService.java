package com.ofos.service;

import com.ofos.dto.request.*;
import com.ofos.dto.response.DeliveryAssignmentResponse;
import com.ofos.dto.response.DeliveryPartnerResponse;
import com.ofos.dto.response.NearbyPartnerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface DeliveryService {
    
    // Delivery Partner Management
    DeliveryPartnerResponse registerDeliveryPartner(DeliveryPartnerRegistrationRequest request, String userEmail);
    
    DeliveryPartnerResponse getDeliveryPartnerProfile(String userEmail);

    Page<DeliveryPartnerResponse> getAllDeliveryPartners(Pageable pageable);
    
    void updatePartnerLocation(PartnerLocationUpdateRequest request, String userEmail);
    
    void updatePartnerStatus(PartnerStatusUpdateRequest request, String userEmail);

    void verifyDeliveryPartner(Long partnerId, Boolean isVerified);

    void updatePartnerAvailability(Long partnerId, Boolean isAvailable);
    
    List<DeliveryPartnerResponse> getAvailablePartners(String zone, Boolean includeUnavailable);
    
    List<NearbyPartnerResponse> getNearbyPartners(Double latitude, Double longitude, Double radiusInKm);
    
    // Delivery Assignment
    DeliveryAssignmentResponse assignDeliveryPartner(DeliveryAssignmentRequest request);
    
    DeliveryAssignmentResponse updateAssignmentStatus(DeliveryStatusUpdateRequest request, String userEmail);
    
    DeliveryAssignmentResponse getAssignmentByOrderId(Long orderId);
    
    List<DeliveryAssignmentResponse> getPartnerAssignments(String userEmail);
    
    // Analytics
    void calculatePartnerEarnings(Long partnerId);

    Map<String, Object> getPartnerEarnings(String userEmail);
}
