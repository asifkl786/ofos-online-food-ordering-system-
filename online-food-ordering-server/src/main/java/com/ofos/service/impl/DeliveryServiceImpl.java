package com.ofos.service.impl;

import com.ofos.dto.request.*;
import com.ofos.dto.response.DeliveryAssignmentResponse;
import com.ofos.dto.response.DeliveryPartnerResponse;
import com.ofos.dto.response.NearbyPartnerResponse;
import com.ofos.entity.*;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.*;
import com.ofos.service.DeliveryService;
import com.ofos.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryServiceImpl implements DeliveryService {
    
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final DeliveryAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ModelMapper modelMapper;
    private final NotificationService notificationService;
    
    // ==================== Delivery Partner Management ====================
    
    @Override
    @Transactional
    public DeliveryPartnerResponse registerDeliveryPartner(DeliveryPartnerRegistrationRequest request, String userEmail) {
        log.info("Registering delivery partner: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        
        // Check if already registered
        if (deliveryPartnerRepository.findByUserId(user.getId()).isPresent()) {
            throw new BusinessException("User already registered as delivery partner");
        }
        
        // Promote the account immediately so partner-only dashboard APIs work after registration and next login.
        if (user.getRole() != UserRole.DELIVERY_PARTNER) {
            user.setRole(UserRole.DELIVERY_PARTNER);
            userRepository.save(user);
        }

        DeliveryPartner partner = new DeliveryPartner();
        partner.setUser(user);
        partner.setVehicleNumber(request.getVehicleNumber());
        partner.setVehicleType(request.getVehicleType());
        partner.setDrivingLicenseNumber(request.getDrivingLicenseNumber());
        partner.setZone(request.getZone());
        partner.setBasePayPerDelivery(request.getBasePayPerDelivery() != null ? 
            request.getBasePayPerDelivery() : BigDecimal.valueOf(40));
        partner.setIsVerified(false);
        // New partners stay unavailable until they intentionally go online from the delivery dashboard.
        partner.setIsAvailable(false);
        partner.setStatus(DeliveryPartnerStatus.OFFLINE);
        
        DeliveryPartner savedPartner = deliveryPartnerRepository.save(partner);
        log.info("Delivery partner registered with id: {}", savedPartner.getId());
        
        return convertToResponse(savedPartner);
    }
    
    @Override
    public DeliveryPartnerResponse getDeliveryPartnerProfile(String userEmail) {
        log.debug("Fetching delivery partner profile: {}", userEmail);
        User user = getUserByEmail(userEmail);
        DeliveryPartner partner = deliveryPartnerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found"));
        return convertToResponse(partner);
    }

    @Override
    public Page<DeliveryPartnerResponse> getAllDeliveryPartners(Pageable pageable) {
        log.debug("Fetching all delivery partners for admin");
        return deliveryPartnerRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    @Transactional
    public void updatePartnerLocation(PartnerLocationUpdateRequest request, String userEmail) {
        log.debug("Updating delivery partner location: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        DeliveryPartner partner = deliveryPartnerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found"));
        
        deliveryPartnerRepository.updateLocation(partner.getId(), 
            request.getLatitude(), request.getLongitude(), request.getAddress());
        
        log.info("Location updated for partner: {}", partner.getId());
    }
    
    @Override
    @Transactional
    public void updatePartnerStatus(PartnerStatusUpdateRequest request, String userEmail) {
        log.info("Updating delivery partner status: {} to {}", userEmail, request.getStatus());
        
        User user = getUserByEmail(userEmail);
        DeliveryPartner partner = deliveryPartnerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found"));
        
        DeliveryPartnerStatus newStatus = DeliveryPartnerStatus.valueOf(request.getStatus().toUpperCase());
        // Availability and status are kept in sync because assignment search only returns available ONLINE partners.
        partner.setIsAvailable(newStatus == DeliveryPartnerStatus.ONLINE);
        deliveryPartnerRepository.updateStatus(partner.getId(), newStatus);
        partner.setStatus(newStatus);
        deliveryPartnerRepository.save(partner);
        
        log.info("Status updated for partner: {} to {}", partner.getId(), newStatus);
    }

    @Override
    @Transactional
    public void verifyDeliveryPartner(Long partnerId, Boolean isVerified) {
        log.info("Updating verification for delivery partner: {} to {}", partnerId, isVerified);
        DeliveryPartner partner = deliveryPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found"));
        partner.setIsVerified(isVerified);
        deliveryPartnerRepository.save(partner);
    }

    @Override
    @Transactional
    public void updatePartnerAvailability(Long partnerId, Boolean isAvailable) {
        log.info("Updating availability for delivery partner: {} to {}", partnerId, isAvailable);
        DeliveryPartner partner = deliveryPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found"));
        partner.setIsAvailable(isAvailable);
        if (!isAvailable) {
            partner.setStatus(DeliveryPartnerStatus.OFFLINE);
        }
        deliveryPartnerRepository.save(partner);
    }
    
    @Override
    public List<DeliveryPartnerResponse> getAvailablePartners(String zone, Boolean includeUnavailable) {
        log.debug("Fetching delivery partners in zone: {}, includeUnavailable: {}", zone, includeUnavailable);
        
        List<DeliveryPartner> partners;
        if (Boolean.TRUE.equals(includeUnavailable)) {
            // Assignment UI should show every registered rider, while the assign action still enforces ONLINE availability.
            partners = deliveryPartnerRepository.findAll();
            if (zone != null && !zone.isEmpty()) {
                partners = partners.stream()
                        .filter(partner -> zone.equalsIgnoreCase(partner.getZone()))
                        .collect(Collectors.toList());
            }
        } else if (zone != null && !zone.isEmpty()) {
            partners = deliveryPartnerRepository.findAvailablePartnersInZone(zone);
        } else {
            partners = deliveryPartnerRepository.findLeastBusyPartners();
        }
        
        return partners.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<NearbyPartnerResponse> getNearbyPartners(Double latitude, Double longitude, Double radiusInKm) {
        log.debug("Fetching nearby partners within {} km", radiusInKm);
        
        // In production, use spatial queries or geohashing
        // For now, return all available partners
        List<DeliveryPartner> partners = deliveryPartnerRepository
                .findByIsAvailableTrueAndStatus(DeliveryPartnerStatus.ONLINE);
        
        return partners.stream()
                .limit(10)
                .map(partner -> NearbyPartnerResponse.builder()
                    .id(partner.getId())
                    .name(partner.getUser().getFirstName() + " " + partner.getUser().getLastName())
                    .phoneNumber(partner.getUser().getPhoneNumber())
                    .distanceInKm(calculateDistance(latitude, longitude, 
                        partner.getCurrentLatitude(), partner.getCurrentLongitude()))
                    .estimatedArrivalMinutes(15) // Calculate based on distance
                    .rating(partner.getAverageRating())
                    .vehicleType(partner.getVehicleType())
                    .build())
                .collect(Collectors.toList());
    }
    
    // ==================== Delivery Assignment ====================
    
    @Override
    @Transactional
    public DeliveryAssignmentResponse assignDeliveryPartner(DeliveryAssignmentRequest request) {
        log.info("Assigning delivery partner to order: {}", request.getOrderId());
        
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        DeliveryPartner partner = deliveryPartnerRepository.findById(request.getDeliveryPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found"));
        
        // Check if already assigned
        if (assignmentRepository.findByOrderId(order.getId()).isPresent()) {
            throw new BusinessException("Delivery partner already assigned to this order");
        }
        
        // Check partner availability
        if (!partner.getIsAvailable() || partner.getStatus() != DeliveryPartnerStatus.ONLINE) {
            throw new BusinessException("Delivery partner is not available");
        }
        
        // Calculate distance (simplified - in production use Google Maps API)
        Double distance = calculateDistance(
            order.getRestaurant().getAddresses().get(0).getLatitude(),
            order.getRestaurant().getAddresses().get(0).getLongitude(),
            partner.getCurrentLatitude(),
            partner.getCurrentLongitude()
        );
        
        // Create assignment
        DeliveryAssignment assignment = new DeliveryAssignment();
        assignment.setOrder(order);
        assignment.setDeliveryPartner(partner);
        assignment.setAssignmentStatus(AssignmentStatus.PENDING);
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setDeliveryFee(order.getDeliveryFee());
        assignment.setTipAmount(request.getTipAmount() != null ? request.getTipAmount() : BigDecimal.ZERO);
        assignment.setDistanceInKm(distance);
        assignment.setEstimatedTimeInMinutes(calculateEstimatedTime(distance));
        
        DeliveryAssignment savedAssignment = assignmentRepository.save(assignment);
        
        // Update order with delivery partner
        order.setDeliveryPartner(partner.getUser());
        order.setStatus(OrderStatus.READY_FOR_PICKUP);
        orderRepository.save(order);
        
        // Mark partner as busy
        partner.setStatus(DeliveryPartnerStatus.BUSY);
        deliveryPartnerRepository.save(partner);
        
        log.info("Delivery partner assigned successfully to order: {}", order.getOrderNumber());
        // Notify both the customer and assigned rider when Phase 1 delivery assignment is persisted.
        safeNotify(order.getUser().getId(), "Delivery partner assigned",
                partner.getUser().getFirstName() + " is assigned for order #" + order.getOrderNumber() + ".",
                NotificationType.DELIVERY_UPDATE, order.getId());
        safeNotify(partner.getUser().getId(), "New delivery assigned",
                "Order #" + order.getOrderNumber() + " is ready for pickup.",
                NotificationType.DELIVERY_UPDATE, order.getId());
        
        return convertToResponse(savedAssignment);
    }
    
    @Override
    @Transactional
    public DeliveryAssignmentResponse updateAssignmentStatus(DeliveryStatusUpdateRequest request, String userEmail) {
        log.info("Updating assignment status: {} to {}", request.getAssignmentId(), request.getStatus());
        
        DeliveryAssignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        
        User user = getUserByEmail(userEmail);
        
        // Verify authorization
        boolean isPartner = assignment.getDeliveryPartner().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        
        if (!isPartner && !isAdmin) {
            throw new BusinessException("Not authorized to update this assignment");
        }
        
        AssignmentStatus newStatus = AssignmentStatus.valueOf(request.getStatus().toUpperCase());
        Order order = assignment.getOrder();
        
        switch (newStatus) {
            case ACCEPTED:
                assignment.setAssignmentStatus(AssignmentStatus.ACCEPTED);
                assignment.setAcceptedAt(LocalDateTime.now());
                break;
                
            case REJECTED:
                assignment.setAssignmentStatus(AssignmentStatus.REJECTED);
                assignment.setRejectionReason(request.getRejectionReason());
                
                // Free up the partner
                DeliveryPartner partner = assignment.getDeliveryPartner();
                partner.setStatus(DeliveryPartnerStatus.ONLINE);
                deliveryPartnerRepository.save(partner);
                break;
                
            case PICKED_UP:
                assignment.setAssignmentStatus(AssignmentStatus.PICKED_UP);
                assignment.setPickedUpAt(LocalDateTime.now());
                order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
                orderRepository.save(order);
                safeNotify(order.getUser().getId(), "Order picked up",
                        "Your order #" + order.getOrderNumber() + " is out for delivery.",
                        NotificationType.DELIVERY_UPDATE, order.getId());
                break;
                
            case DELIVERED:
                assignment.setAssignmentStatus(AssignmentStatus.DELIVERED);
                assignment.setDeliveredAt(LocalDateTime.now());
                
                // Calculate actual time
                if (assignment.getAcceptedAt() != null) {
                    long minutes = java.time.Duration.between(
                        assignment.getAcceptedAt(), LocalDateTime.now()).toMinutes();
                    assignment.setActualTimeInMinutes((int) minutes);
                }
                
                // Update order status
                order.setStatus(OrderStatus.DELIVERED);
                order.setDeliveryTime(LocalDateTime.now());
                order.setPaymentStatus(PaymentStatus.SUCCESS);
                orderRepository.save(order);
                
                // Update partner earnings
                DeliveryPartner dpartner = assignment.getDeliveryPartner();
                BigDecimal earnings = resolveAssignmentEarning(assignment);
                dpartner.setTotalEarnings(value(dpartner.getTotalEarnings()).add(earnings));
                dpartner.setTotalDeliveries((dpartner.getTotalDeliveries() != null ? dpartner.getTotalDeliveries() : 0) + 1);
                
                // Mark partner as available again
                dpartner.setStatus(DeliveryPartnerStatus.ONLINE);
                dpartner.setIsAvailable(true);
                deliveryPartnerRepository.save(dpartner);
                safeNotify(order.getUser().getId(), "Order delivered",
                        "Order #" + order.getOrderNumber() + " has been delivered. You can rate the restaurant now.",
                        NotificationType.ORDER_DELIVERED, order.getId());
                break;
                
            default:
                throw new BusinessException("Invalid status update: " + newStatus);
        }
        
        DeliveryAssignment updatedAssignment = assignmentRepository.save(assignment);
        log.info("Assignment status updated to: {}", newStatus);
        
        return convertToResponse(updatedAssignment);
    }
    
    @Override
    public DeliveryAssignmentResponse getAssignmentByOrderId(Long orderId) {
        log.debug("Fetching assignment for order: {}", orderId);
        DeliveryAssignment assignment = assignmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found for order: " + orderId));
        return convertToResponse(assignment);
    }
    
    @Override
    public List<DeliveryAssignmentResponse> getPartnerAssignments(String userEmail) {
        log.debug("Fetching assignments for partner: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        DeliveryPartner partner = deliveryPartnerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found"));
        
        // Dashboard needs both active and completed jobs so riders can see their delivery history.
        List<DeliveryAssignment> assignments = assignmentRepository.findByDeliveryPartnerId(partner.getId());
        
        return assignments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // ==================== Analytics ====================
    
    @Override
    public void calculatePartnerEarnings(Long partnerId) {
        // Already updated in real-time when delivery is completed
        log.debug("Calculating earnings for partner: {}", partnerId);
    }

    @Override
    public Map<String, Object> getPartnerEarnings(String userEmail) {
        User user = getUserByEmail(userEmail);
        DeliveryPartner partner = deliveryPartnerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found"));

        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        List<DeliveryAssignment> deliveredAssignments = assignmentRepository.findByDeliveryPartnerId(partner.getId())
                .stream()
                .filter(assignment -> assignment.getAssignmentStatus() == AssignmentStatus.DELIVERED)
                .collect(Collectors.toList());

        BigDecimal totalEarnings = deliveredAssignments.stream()
                .map(this::resolveAssignmentEarning)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal thisMonth = deliveredAssignments.stream()
                .filter(assignment -> assignment.getDeliveredAt() != null
                        && !assignment.getDeliveredAt().toLocalDate().isBefore(monthStart))
                .map(this::resolveAssignmentEarning)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalDeliveries = deliveredAssignments.size();
        Double rating = partner.getAverageRating() != null ? partner.getAverageRating() : 0.0;

        Map<String, Object> earnings = new HashMap<>();
        earnings.put("totalEarnings", totalEarnings);
        earnings.put("total", totalEarnings);
        earnings.put("totalDeliveries", totalDeliveries);
        earnings.put("deliveries", totalDeliveries);
        earnings.put("thisMonth", thisMonth);
        earnings.put("averageRating", rating);
        earnings.put("rating", rating);
        return earnings;
    }
    
    // ==================== Helper Methods ====================
    
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    private Double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 5.0; // Default distance in km
        }
        
        // Haversine formula for distance calculation
        double R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return Math.round(R * c * 10.0) / 10.0;
    }
    
    private Integer calculateEstimatedTime(Double distanceInKm) {
        // Assume average speed of 30 km/h in city
        return (int) Math.ceil(distanceInKm / 30 * 60);
    }
    
    private DeliveryPartnerResponse convertToResponse(DeliveryPartner partner) {
        DeliveryPartnerResponse response = modelMapper.map(partner, DeliveryPartnerResponse.class);
        response.setUserId(partner.getUser().getId());
        response.setName(partner.getUser().getFirstName() + " " + partner.getUser().getLastName());
        response.setPhoneNumber(partner.getUser().getPhoneNumber());
        response.setEmail(partner.getUser().getEmail());
        response.setStatus(partner.getStatus().toString());
        return response;
    }
    
    private DeliveryAssignmentResponse convertToResponse(DeliveryAssignment assignment) {
        DeliveryAssignmentResponse response = new DeliveryAssignmentResponse();
        response.setId(assignment.getId());
        response.setOrderId(assignment.getOrder().getId());
        response.setOrderNumber(assignment.getOrder().getOrderNumber());
        response.setDeliveryPartnerId(assignment.getDeliveryPartner().getId());
        response.setDeliveryPartnerName(
            assignment.getDeliveryPartner().getUser().getFirstName() + " " +
            assignment.getDeliveryPartner().getUser().getLastName()
        );
        response.setAssignmentStatus(assignment.getAssignmentStatus().toString());
        response.setAssignedAt(assignment.getAssignedAt());
        response.setAcceptedAt(assignment.getAcceptedAt());
        response.setPickedUpAt(assignment.getPickedUpAt());
        response.setDeliveredAt(assignment.getDeliveredAt());
        response.setDeliveryFee(resolveAssignmentEarning(assignment));
        response.setTipAmount(assignment.getTipAmount());
        response.setDistanceInKm(assignment.getDistanceInKm());
        response.setEstimatedTimeInMinutes(assignment.getEstimatedTimeInMinutes());
        
        // Add customer details
        response.setCustomerPhone(assignment.getOrder().getUser().getPhoneNumber());
        response.setCustomerAddress(assignment.getOrder().getDeliveryAddress().getStreetAddress());
        
        // Add restaurant details
        response.setRestaurantName(assignment.getOrder().getRestaurant().getName());
        response.setRestaurantAddress(
            assignment.getOrder().getRestaurant().getAddresses().get(0).getStreetAddress()
        );
        
        return response;
    }

    private BigDecimal resolveAssignmentEarning(DeliveryAssignment assignment) {
        BigDecimal deliveryFee = assignment.getDeliveryFee() != null ? assignment.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal tip = assignment.getTipAmount() != null ? assignment.getTipAmount() : BigDecimal.ZERO;
        if (deliveryFee.compareTo(BigDecimal.ZERO) > 0) {
            return deliveryFee.add(tip);
        }

        DeliveryPartner partner = assignment.getDeliveryPartner();
        BigDecimal basePay = partner != null && partner.getBasePayPerDelivery() != null
                ? partner.getBasePayPerDelivery()
                : BigDecimal.valueOf(40);
        BigDecimal bonus = partner != null && partner.getBonusPerDelivery() != null
                ? partner.getBonusPerDelivery()
                : BigDecimal.ZERO;
        return basePay.add(bonus).add(tip);
    }

    private BigDecimal value(BigDecimal amount) {
        return amount != null ? amount : BigDecimal.ZERO;
    }

    private void safeNotify(Long userId, String title, String message, NotificationType type, Long orderId) {
        try {
            notificationService.createInAppNotification(userId, title, message, type, orderId);
        } catch (Exception e) {
            log.warn("Delivery notification skipped: {}", e.getMessage());
        }
    }
}
