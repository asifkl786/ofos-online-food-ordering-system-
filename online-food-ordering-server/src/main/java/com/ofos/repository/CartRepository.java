package com.ofos.repository;

import com.ofos.entity.Cart;
import com.ofos.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    Optional<Cart> findByUser(User user);
    
    Optional<Cart> findByUserId(Long userId);
    
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.user.id = :userId")
    Optional<Cart> findCartWithItemsByUserId(@Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Cart c SET c.totalAmount = :totalAmount, c.totalItems = :totalItems, " +
           "c.grandTotal = :grandTotal, c.tax = :tax, c.deliveryFee = :deliveryFee " +
           "WHERE c.id = :cartId")
    void updateCartTotals(@Param("cartId") Long cartId,
                          @Param("totalAmount") BigDecimal totalAmount,
                          @Param("totalItems") Integer totalItems,
                          @Param("grandTotal") BigDecimal grandTotal,
                          @Param("tax") BigDecimal tax,
                          @Param("deliveryFee") BigDecimal deliveryFee);
    
    @Modifying
    @Transactional
    @Query("UPDATE Cart c SET c.restaurantId = :restaurantId, c.restaurantName = :restaurantName " +
           "WHERE c.id = :cartId")
    void updateRestaurantInfo(@Param("cartId") Long cartId,
                              @Param("restaurantId") Long restaurantId,
                              @Param("restaurantName") String restaurantName);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Cart c WHERE c.user.id = :userId")
    void deleteCartByUserId(@Param("userId") Long userId);
    
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Cart c WHERE c.user.id = :userId")
    boolean existsByUserId(@Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Cart c SET c.totalItems = 0, c.totalAmount = 0, c.grandTotal = 0, " +
           "c.restaurantId = null, c.restaurantName = null WHERE c.id = :cartId")
    void clearCart(@Param("cartId") Long cartId);
}