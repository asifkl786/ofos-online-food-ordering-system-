package com.ofos.service;

import com.ofos.dto.response.NotificationResponse;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface NotificationStreamService {

    SseEmitter subscribe(Long userId);

    void publish(Long userId, NotificationResponse notification);
}
