package com.ofos.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.ofos.entity.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByCartId(Long cartId);
    
    Optional<CartItem> findByCartIdAndMenuItemId(Long cartId, Long menuItemId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId")
    void deleteAllByCartId(@Param("cartId") Long cartId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItem ci WHERE ci.id = :cartItemId AND ci.cart.id = :cartId")
    void deleteCartItem(@Param("cartItemId") Long cartItemId, @Param("cartId") Long cartId);
    
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.cart.id = :cartId")
    Integer countItemsInCart(@Param("cartId") Long cartId);
    
    @Query("SELECT COALESCE(SUM(ci.subtotal), 0) FROM CartItem ci WHERE ci.cart.id = :cartId")
    BigDecimal calculateCartTotal(@Param("cartId") Long cartId);
    
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.user.id = :userId")
    List<CartItem> findCartItemsByUserId(@Param("userId") Long userId);
}