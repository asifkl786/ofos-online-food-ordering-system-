package com.ofos.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.ofos.entity.OrderStatus;
import com.ofos.entity.PaymentStatus;
import com.ofos.entity.Order;
import com.ofos.entity.User;



@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    Page<Order> findByUser(User user, Pageable pageable);
    
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    Page<Order> findByRestaurantId(Long restaurantId, Pageable pageable);

    // Owner dashboard needs one paginated stream across every restaurant owned by the logged-in owner.
    @Query("SELECT o FROM Order o WHERE o.restaurant.owner.email = :ownerEmail ORDER BY o.createdAt DESC")
    Page<Order> findByRestaurantOwnerEmail(@Param("ownerEmail") String ownerEmail, Pageable pageable);
    
    List<Order> findByRestaurantIdAndStatus(Long restaurantId, OrderStatus status);
    
    List<Order> findByDeliveryPartnerAndStatusIn(User deliveryPartner, List<OrderStatus> statuses);
    
    List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime dateTime);
    
    long countByStatusIn(List<OrderStatus> statuses);
    
    long countByPaymentStatus(PaymentStatus paymentStatus);
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal calculateDeliveredRevenue();

    @Query("SELECT COALESCE(SUM(COALESCE(o.platformCommission, (COALESCE(o.subtotal, 0) - COALESCE(o.discount, 0)) * :rate)), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal calculateDeliveredPlatformCommission(@Param("rate") BigDecimal rate);

    @Query("SELECT COALESCE(SUM(COALESCE(o.restaurantPayout, COALESCE(o.totalAmount, 0) - ((COALESCE(o.subtotal, 0) - COALESCE(o.discount, 0)) * :rate))), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal calculateDeliveredRestaurantPayout(@Param("rate") BigDecimal rate);
    
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status IN :statuses")
    List<Order> findActiveOrdersByUser(@Param("userId") Long userId, @Param("statuses") List<OrderStatus> statuses);
    
    @Modifying
    @Transactional
    @Query("UPDATE Order o SET o.status = :newStatus WHERE o.id = :orderId")
    int updateOrderStatus(@Param("orderId") Long orderId, @Param("newStatus") OrderStatus newStatus);
    
    @Modifying
    @Transactional
    @Query("UPDATE Order o SET o.paymentStatus = :paymentStatus WHERE o.id = :orderId")
    void updatePaymentStatus(@Param("orderId") Long orderId, @Param("paymentStatus") PaymentStatus paymentStatus);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant.id = :restaurantId AND o.createdAt BETWEEN :startDate AND :endDate")
    Long countOrdersByRestaurantAndDateRange(@Param("restaurantId") Long restaurantId,
                                             @Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.restaurant.id = :restaurantId AND o.status = 'DELIVERED' AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getRevenueByDateRange(@Param("restaurantId") Long restaurantId,
                                     @Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE o.deliveryPartner.id = :deliveryPartnerId AND o.status = 'OUT_FOR_DELIVERY'")
    List<Order> findActiveDeliveriesForPartner(@Param("deliveryPartnerId") Long deliveryPartnerId);
    
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    Page<Order> findRecentOrdersByUser(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.createdAt < :timeout")
    List<Order> findTimeoutOrders(@Param("status") OrderStatus status, @Param("timeout") LocalDateTime timeout);

    @Query("SELECT o FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findDeliveredOrdersBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}

