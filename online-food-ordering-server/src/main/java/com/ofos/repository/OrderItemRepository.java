package com.ofos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ofos.entity.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByOrderId(Long orderId);
    
    List<OrderItem> findByMenuItemId(Long menuItemId);
    
    @Query("SELECT oi.menuItem.id, SUM(oi.quantity) FROM OrderItem oi WHERE oi.order.restaurant.id = :restaurantId GROUP BY oi.menuItem.id ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingItems(@Param("restaurantId") Long restaurantId, org.springframework.data.domain.Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.menuItem.id = :menuItemId")
    Long getTotalQuantitySoldForMenuItem(@Param("menuItemId") Long menuItemId);
}