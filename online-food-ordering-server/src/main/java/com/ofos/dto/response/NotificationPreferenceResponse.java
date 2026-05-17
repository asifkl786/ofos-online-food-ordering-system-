package com.ofos.dto.response;

import lombok.Data;

@Data
public class NotificationPreferenceResponse {
    private Long userId;
    private String userEmail;
    private String userName;
    private Boolean emailEnabled;
    private Boolean smsEnabled;
    private Boolean whatsappEnabled;
    private Boolean pushEnabled;
    private Boolean orderUpdatesEnabled;
    private Boolean promotionalEnabled;
    private Boolean paymentAlertsEnabled;
    private String emailAddress;
    private String phoneNumber;
    private String whatsappNumber;
}
