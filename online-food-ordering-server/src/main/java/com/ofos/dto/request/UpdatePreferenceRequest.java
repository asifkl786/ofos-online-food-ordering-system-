package com.ofos.dto.request;

import lombok.Data;

@Data
public class UpdatePreferenceRequest {
    
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
    private String deviceToken;
}
