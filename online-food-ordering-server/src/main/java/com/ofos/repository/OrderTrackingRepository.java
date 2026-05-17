package com.ofos.repository;

import com.ofos.entity.OrderTracking;
import com.ofos.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderTrackingRepository extends JpaRepository<OrderTracking, Long> {
    
    Optional<OrderTracking> findByOrderId(Long orderId);
    
    @Query("SELECT ot FROM OrderTracking ot WHERE ot.currentStatus = :status")
    List<OrderTracking> findByCurrentStatus(@Param("status") OrderStatus status);
    
    @Query("SELECT ot FROM OrderTracking ot WHERE ot.order.deliveryPartner.id = :partnerId")
    List<OrderTracking> findByDeliveryPartnerId(@Param("partnerId") Long partnerId);
    
    @Modifying
    @Transactional
    @Query("UPDATE OrderTracking ot SET ot.currentLatitude = :latitude, " +
           "ot.currentLongitude = :longitude, ot.lastUpdateTime = CURRENT_TIMESTAMP, " +
           "ot.currentLocationAddress = :address, ot.estimatedRemainingMinutes = :minutes " +
           "WHERE ot.order.id = :orderId")
    void updateDeliveryLocation(@Param("orderId") Long orderId,
                                @Param("latitude") Double latitude,
                                @Param("longitude") Double longitude,
                                @Param("address") String address,
                                @Param("minutes") Integer minutes);
    
    @Modifying
    @Transactional
    @Query("UPDATE OrderTracking ot SET ot.estimatedRemainingMinutes = :minutes " +
           "WHERE ot.order.id = :orderId")
    void updateEstimatedTime(@Param("orderId") Long orderId,
                             @Param("minutes") Integer minutes);
    
    @Modifying
    @Transactional
    @Query("UPDATE OrderTracking ot SET ot.currentStatus = :status, " +
           "ot.lastUpdateTime = CURRENT_TIMESTAMP " +
           "WHERE ot.order.id = :orderId")
    void updateCurrentStatus(@Param("orderId") Long orderId,
                             @Param("status") OrderStatus status);
    
    @Query("SELECT ot.estimatedRemainingMinutes FROM OrderTracking ot WHERE ot.order.id = :orderId")
   // Integer getEstimatedMinutes(@Param("orderId") Long orderId);
    Optional<Integer> getEstimatedMinutes(@Param("orderId") Long orderId);
}