package com.ofos.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    @MessageMapping("/tracking.subscribe")
    public void subscribeToTracking(@Payload Map<String, Object> payload) {
        Long orderId = Long.valueOf(payload.get("orderId").toString());
        log.info("Client subscribed to tracking for order: {}", orderId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("type", "SUBSCRIBED");
        response.put("orderId", orderId);
        response.put("timestamp", LocalDateTime.now().toString());
        
        messagingTemplate.convertAndSend("/topic/orders/" + orderId, response);
    }
    
    @MessageMapping("/delivery.location")
    public void handleDeliveryLocation(@Payload Map<String, Object> location) {
        Long orderId = Long.valueOf(location.get("orderId").toString());
        log.debug("Received location update for order: {}", orderId);
        
        // Broadcast to all subscribers of this order
        messagingTemplate.convertAndSend("/topic/orders/" + orderId + "/location", location);
    }
}