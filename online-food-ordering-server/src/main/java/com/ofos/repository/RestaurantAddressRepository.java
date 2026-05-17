package com.ofos.repository;

import com.ofos.entity.RestaurantAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantAddressRepository extends JpaRepository<RestaurantAddress, Long> {
    
    List<RestaurantAddress> findByRestaurantId(Long restaurantId);
    
    Optional<RestaurantAddress> findByRestaurantIdAndIsPrimaryTrue(Long restaurantId);
    
    @Modifying
    @Transactional
    @Query("UPDATE RestaurantAddress ra SET ra.isPrimary = false WHERE ra.restaurant.id = :restaurantId")
    void resetPrimaryAddress(@Param("restaurantId") Long restaurantId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM RestaurantAddress ra WHERE ra.restaurant.id = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") Long restaurantId);
}
