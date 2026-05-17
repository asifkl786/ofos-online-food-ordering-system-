package com.ofos.repository;

import com.ofos.entity.DeliveryPartner;
import com.ofos.entity.DeliveryPartnerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {

    Page<DeliveryPartner> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    Optional<DeliveryPartner> findByUserId(Long userId);
    
    Optional<DeliveryPartner> findByUserEmail(String email);
    
    List<DeliveryPartner> findByIsAvailableTrueAndStatus(DeliveryPartnerStatus status);
    
    // ✅ FIXED: Added zone parameter
    List<DeliveryPartner> findByZoneAndIsAvailableTrueAndStatus(String zone, DeliveryPartnerStatus status);
   // List<DeliveryPartner> findByZoneAndIsAvailableTrueAndStatus(DeliveryPartnerStatus status);
    
    @Query("SELECT dp FROM DeliveryPartner dp WHERE dp.isAvailable = true " +
           "AND dp.status = 'ONLINE' AND dp.zone = :zone")
    List<DeliveryPartner> findAvailablePartnersInZone(@Param("zone") String zone);
    
    @Query("SELECT dp FROM DeliveryPartner dp WHERE dp.isAvailable = true " +
           "AND dp.status = 'ONLINE' ORDER BY dp.totalDeliveries ASC")
    List<DeliveryPartner> findLeastBusyPartners();
    
    @Modifying
    @Transactional
    @Query("UPDATE DeliveryPartner dp SET dp.currentLatitude = :latitude, " +
           "dp.currentLongitude = :longitude, dp.currentAddress = :address " +
           "WHERE dp.id = :partnerId")
    void updateLocation(@Param("partnerId") Long partnerId,
                        @Param("latitude") Double latitude,
                        @Param("longitude") Double longitude,
                        @Param("address") String address);
    
    @Modifying
    @Transactional
    @Query("UPDATE DeliveryPartner dp SET dp.status = :status WHERE dp.id = :partnerId")
    void updateStatus(@Param("partnerId") Long partnerId,
                      @Param("status") DeliveryPartnerStatus status);
    
    @Modifying
    @Transactional
    @Query("UPDATE DeliveryPartner dp SET dp.totalEarnings = dp.totalEarnings + :earnings, " +
           "dp.totalDeliveries = dp.totalDeliveries + 1 WHERE dp.id = :partnerId")
    void updateEarnings(@Param("partnerId") Long partnerId,
                        @Param("earnings") java.math.BigDecimal earnings);
}
