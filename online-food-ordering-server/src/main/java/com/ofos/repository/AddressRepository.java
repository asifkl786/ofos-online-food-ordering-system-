package com.ofos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.ofos.entity.User;
import com.ofos.entity.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    
    List<Address> findByUser(User user);
    
    List<Address> findByUserId(Long userId);
    
    Optional<Address> findByIdAndUser(Long id, User user);
    
    Optional<Address> findByUserIdAndIsDefaultTrue(Long userId);
    
    @Query("SELECT a FROM Address a WHERE a.user.id = :userId AND a.isActive = true")
    List<Address> findActiveAddressesByUserId(@Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId")
    void resetDefaultAddress(@Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Address a SET a.isDefault = true WHERE a.id = :addressId AND a.user.id = :userId")
    void setDefaultAddress(@Param("addressId") Long addressId, @Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Address a SET a.isActive = false WHERE a.id = :addressId")
    void softDeleteAddress(@Param("addressId") Long addressId);
    
    @Query("SELECT a FROM Address a WHERE a.user.id = :userId AND a.addressType = :addressType")
    List<Address> findAddressesByType(@Param("userId") Long userId, @Param("addressType") String addressType);
    
    @Query("SELECT COUNT(a) FROM Address a WHERE a.user.id = :userId AND a.isActive = true")
    Long countActiveAddressesByUserId(@Param("userId") Long userId);
}
