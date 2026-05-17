package com.ofos.service;

import com.ofos.dto.request.DeliveryAssignmentRequest;
import com.ofos.dto.request.OrderRequest;
import com.ofos.dto.request.OrderStatusUpdateRequest;
import com.ofos.dto.response.OrderResponse;
import com.ofos.dto.response.OrderSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    
    OrderResponse createOrder(OrderRequest request, String userEmail);
    
    OrderResponse getOrderById(Long orderId);
    
    OrderResponse getOrderByNumber(String orderNumber);
    
    Page<OrderResponse> getUserOrders(String userEmail, Pageable pageable);
    
    Page<OrderResponse> getRestaurantOrders(Long restaurantId, Pageable pageable, String userEmail);
    
    Page<OrderResponse> getOwnerOrders(String userEmail, Pageable pageable);
    
    Page<OrderResponse> getAllOrders(Pageable pageable);
    
    OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request, String userEmail);
    
    OrderResponse assignDeliveryPartner(Long orderId, DeliveryAssignmentRequest request);
    
    OrderResponse cancelOrder(Long orderId, String cancellationReason, String userEmail);
    
    Page<OrderSummaryResponse> getOrderHistory(String userEmail, Pageable pageable);
    
    Long getActiveOrdersCount(String userEmail);
    
    void processOrderPayment(Long orderId, String paymentDetails);
}

