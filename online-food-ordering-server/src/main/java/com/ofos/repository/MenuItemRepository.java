package com.ofos.repository;

import com.ofos.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    
    List<MenuItem> findByRestaurantId(Long restaurantId);
    
    Page<MenuItem> findByRestaurantId(Long restaurantId, Pageable pageable);

    Page<MenuItem> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    Page<MenuItem> findByRestaurantIdAndIsAvailableTrue(Long restaurantId, Pageable pageable);
    
    List<MenuItem> findByRestaurantIdAndCategoryId(Long restaurantId, Long categoryId);
    
    List<MenuItem> findByRestaurantIdAndIsVegetarianTrue(Long restaurantId);
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurant.id = :restaurantId AND m.price BETWEEN :minPrice AND :maxPrice")
    List<MenuItem> findMenuItemsByPriceRange(@Param("restaurantId") Long restaurantId,
                                              @Param("minPrice") BigDecimal minPrice,
                                              @Param("maxPrice") BigDecimal maxPrice);
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurant.id = :restaurantId AND LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<MenuItem> searchMenuItems(@Param("restaurantId") Long restaurantId, 
                                    @Param("keyword") String keyword, 
                                    Pageable pageable);
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurant.id = :restaurantId AND m.discountPercentage > 0")
    List<MenuItem> findDiscountedItems(@Param("restaurantId") Long restaurantId);
    
    @Modifying
    @Transactional
    @Query("UPDATE MenuItem m SET m.isAvailable = :isAvailable WHERE m.id = :menuItemId")
    void updateAvailability(@Param("menuItemId") Long menuItemId, @Param("isAvailable") Boolean isAvailable);
    
    @Modifying
    @Transactional
    @Query("UPDATE MenuItem m SET m.price = :newPrice WHERE m.id = :menuItemId")
    void updatePrice(@Param("menuItemId") Long menuItemId, @Param("newPrice") BigDecimal newPrice);
    
    @Modifying
    @Transactional
    @Query("UPDATE MenuItem m SET m.discountPercentage = :discount WHERE m.id = :menuItemId")
    void updateDiscount(@Param("menuItemId") Long menuItemId, @Param("discount") Integer discount);
    
    @Query("SELECT m FROM MenuItem m WHERE m.restaurant.id = :restaurantId ORDER BY m.createdAt DESC")
    List<MenuItem> findRecentMenuItems(@Param("restaurantId") Long restaurantId, Pageable pageable);
    
    @Query("SELECT COUNT(m) FROM MenuItem m WHERE m.restaurant.id = :restaurantId AND m.isAvailable = true")
    Long countAvailableMenuItems(@Param("restaurantId") Long restaurantId);
    
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.menuItem.id = :menuItemId")
    Integer getTotalOrdersCountForMenuItem(@Param("menuItemId") Long menuItemId);
}
